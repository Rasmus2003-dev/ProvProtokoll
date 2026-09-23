import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DrivingEvent } from '../../types';
import { EVENT_META, RoutePoint } from '../../lib/route';

interface RouteMapProps {
  points: RoutePoint[];
  events?: DrivingEvent[]; // i kronologisk ordning; numreras 1, 2, 3...
  // Följ senaste positionen (live under körning)
  follow?: boolean;
  livePosition?: { lat: number; lng: number; accuracy?: number } | null;
  // Markör för uppspelning i efterhand
  playbackPosition?: [number, number] | null;
  focusEventId?: string | null;
  onEventClick?: (id: string) => void;
  className?: string;
}

const SWEDEN_CENTER: L.LatLngExpression = [62.0, 15.0];

// CARTO-kartor (Voyager / Dark Matter) kräver nyckel, satt i .env som VITE_CARTO_API_KEY.
// Utan nyckel används vanliga OpenStreetMap-kartan.
const CARTO_KEY: string | undefined = import.meta.env.VITE_CARTO_API_KEY;
const cartoUrl = (style: string) =>
  `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_KEY || '')}`;
const CARTO_OPTIONS: L.TileLayerOptions = {
  maxZoom: 19,
  subdomains: 'abcd',
  attribution: '&copy; OpenStreetMap &copy; CARTO',
};

type MapStyle = 'karta' | 'satellit';
const STYLE_STORAGE_KEY = 'provprotokoll-map-style';

function readStoredStyle(): MapStyle {
  try {
    return localStorage.getItem(STYLE_STORAGE_KEY) === 'satellit' ? 'satellit' : 'karta';
  } catch (_) {
    return 'karta';
  }
}

// Följer appens mörka läge (klassen "dark" på <html>)
function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function eventIcon(number: number, color: string, focused: boolean) {
  const size = focused ? 34 : 26;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};color:#fff;
      font:800 ${focused ? 14 : 12}px/1 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;
      border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">${number}</div>`,
  });
}

function dotIcon(color: string, label: string) {
  return L.divIcon({
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<div title="${label}" style="width:22px;height:22px;border-radius:6px;background:${color};color:#fff;
      font:900 11px/1 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${label}</div>`,
  });
}

export function RouteMap({
  points,
  events = [],
  follow = false,
  livePosition = null,
  playbackPosition = null,
  focusEventId = null,
  onEventClick,
  className = 'h-72',
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const dataLayerRef = useRef<L.LayerGroup | null>(null);
  const liveLayerRef = useRef<L.LayerGroup | null>(null);
  const hasFittedRef = useRef(false);
  const boundsRef = useRef<L.LatLngBounds | null>(null);
  const userMovedRef = useRef(false);
  const baseLayerRef = useRef<L.LayerGroup | null>(null);
  const onEventClickRef = useRef(onEventClick);
  onEventClickRef.current = onEventClick;

  const [mapStyle, setMapStyle] = useState<MapStyle>(readStoredStyle);
  const isDark = useIsDarkMode();
  const onImagery = mapStyle === 'satellit' || isDark;
  // Ljusare linje på mörk karta/satellit, mörkblå på ljus karta
  const lineColor = onImagery ? '#3b82f6' : '#002f6c';

  const chooseStyle = (style: MapStyle) => {
    setMapStyle(style);
    try { localStorage.setItem(STYLE_STORAGE_KEY, style); } catch (_) {}
  };

  // Skapa kartan en gång
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(SWEDEN_CENTER, 5);
    map.attributionControl.setPrefix(false);
    baseLayerRef.current = L.layerGroup().addTo(map);
    dataLayerRef.current = L.layerGroup().addTo(map);
    liveLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Kartan kan monteras i en dold/animerad behållare – räkna om storleken och
    // anpassa vyn igen tills inspektören själv har flyttat kartan
    map.on('dragstart', () => { userMovedRef.current = true; });
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      if (boundsRef.current && !userMovedRef.current) {
        map.fitBounds(boundsRef.current, { padding: [28, 28], maxZoom: 17 });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      hasFittedRef.current = false;
    };
  }, []);

  // Byt kartbakgrund (karta/satellit, ljus/mörk)
  useEffect(() => {
    const base = baseLayerRef.current;
    if (!base) return;
    base.clearLayers();
    if (mapStyle === 'satellit') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        maxNativeZoom: 18,
        attribution: 'Bild &copy; Esri',
      }).addTo(base);
      // Gatunamn ovanpå flygbilden
      if (CARTO_KEY) {
        L.tileLayer(cartoUrl('rastertiles/voyager_only_labels'), CARTO_OPTIONS).addTo(base);
      }
    } else if (CARTO_KEY) {
      L.tileLayer(cartoUrl(isDark ? 'dark_all' : 'rastertiles/voyager'), CARTO_OPTIONS).addTo(base);
    } else {
      // Reserv utan nyckel
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(base);
    }
  }, [mapStyle, isDark]);

  // Rita rutt och händelser
  useEffect(() => {
    const map = mapRef.current;
    const layer = dataLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const latLngs = points.map(p => [p[0], p[1]] as L.LatLngTuple);
    if (latLngs.length > 1) {
      // Vit "kant" under linjen gör rutten läsbar mot kartan
      L.polyline(latLngs, { color: '#ffffff', weight: 9, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(layer);
      L.polyline(latLngs, { color: lineColor, weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(layer);
    }
    if (latLngs.length > 0) {
      L.marker(latLngs[0], { icon: dotIcon('#059669', 'S'), interactive: false }).addTo(layer);
      if (!follow && latLngs.length > 1) {
        L.marker(latLngs[latLngs.length - 1], { icon: dotIcon('#111827', 'M'), interactive: false }).addTo(layer);
      }
    }

    const located: L.LatLngTuple[] = [];
    events.forEach((ev, idx) => {
      if (typeof ev.lat !== 'number' || typeof ev.lng !== 'number') return;
      const focused = ev.id === focusEventId;
      const marker = L.marker([ev.lat, ev.lng], {
        icon: eventIcon(idx + 1, EVENT_META[ev.kind].color, focused),
        zIndexOffset: focused ? 1000 : 500,
      }).addTo(layer);
      const title = [EVENT_META[ev.kind].label, ev.situation].filter(Boolean).join(' – ');
      marker.bindTooltip(`<b>${idx + 1}. ${title}</b>${ev.note ? `<br/>${ev.note.replace(/</g, '&lt;')}` : ''}`, { direction: 'top', offset: [0, -12] });
      marker.on('click', () => onEventClickRef.current?.(ev.id));
      located.push([ev.lat, ev.lng]);
    });

    // Anpassa vyn en gång när det finns data (inte under live-följning)
    const all = [...latLngs, ...located];
    if (!follow && !hasFittedRef.current && all.length > 0) {
      if (all.length === 1) map.setView(all[0], 16);
      else {
        boundsRef.current = L.latLngBounds(all);
        map.fitBounds(boundsRef.current, { padding: [28, 28], maxZoom: 17 });
      }
      hasFittedRef.current = true;
    }
  }, [points, events, follow, focusEventId, lineColor]);

  // Live-position och uppspelningsmarkör
  useEffect(() => {
    const map = mapRef.current;
    const layer = liveLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (livePosition) {
      if (livePosition.accuracy && livePosition.accuracy > 15) {
        L.circle([livePosition.lat, livePosition.lng], {
          radius: livePosition.accuracy, color: '#2563eb', weight: 1, fillOpacity: 0.08,
        }).addTo(layer);
      }
      L.circleMarker([livePosition.lat, livePosition.lng], {
        radius: 8, color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1,
      }).addTo(layer);
      if (follow) {
        map.setView([livePosition.lat, livePosition.lng], Math.max(map.getZoom(), 16), { animate: true });
      }
    } else if (follow && points.length > 0) {
      const last = points[points.length - 1];
      map.setView([last[0], last[1]], Math.max(map.getZoom(), 16), { animate: true });
    }

    if (playbackPosition) {
      L.circleMarker(playbackPosition, {
        radius: 10, color: '#ffffff', weight: 3, fillColor: '#DD1D25', fillOpacity: 1,
      }).addTo(layer);
    }
  }, [livePosition, playbackPosition, follow, points]);

  // Zooma till vald händelse
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusEventId) return;
    const ev = events.find(e => e.id === focusEventId);
    if (ev && typeof ev.lat === 'number' && typeof ev.lng === 'number') {
      map.setView([ev.lat, ev.lng], Math.max(map.getZoom(), 17), { animate: true });
    }
  }, [focusEventId, events]);

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 isolate ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {/* Karta / Satellit */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-md border border-black/10 dark:border-white/10 p-0.5 backdrop-blur-sm">
        {(['karta', 'satellit'] as MapStyle[]).map(style => (
          <button
            key={style}
            type="button"
            onClick={() => chooseStyle(style)}
            className={`h-8 px-3 rounded-md text-xs font-bold capitalize transition-colors cursor-pointer ${
              mapStyle === style
                ? 'bg-[#002f6c] dark:bg-blue-600 text-white'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
}
