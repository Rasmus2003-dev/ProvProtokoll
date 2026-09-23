import { useEffect } from 'react';
import { AppState } from '../types';
import { distanceM } from '../lib/route';
import { setGeo } from '../lib/geoStore';

const MAX_ACCURACY_M = 60;   // sämre positioner än så ignoreras
const MIN_STEP_M = 12;       // ny punkt när man flyttat sig minst så här långt...
const MAX_GAP_MS = 20000;    // ...eller efter så här lång tid (med viss rörelse)
const MIN_IDLE_STEP_M = 4;

// Spelar in körvägen så länge state.route.recording är sant och `active`
// (inspektören är i provflödet). Lever i provlayouten så att inspelningen
// fortsätter när man byter flik, och återupptas efter omladdning.
export function useRouteRecorder(
  recording: boolean,
  active: boolean,
  updateState: (update: (prev: AppState) => AppState) => void
) {
  useEffect(() => {
    if (!recording || !active) return;
    if (!('geolocation' in navigator)) {
      setGeo({ error: 'Enheten saknar stöd för GPS-position.' });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const t = Date.now();
        setGeo({ fix: { lat: latitude, lng: longitude, accuracy, speed, t }, error: null });
        if (accuracy > MAX_ACCURACY_M) return;

        updateState((prev) => {
          const route = prev.route;
          if (!route?.recording) return prev;
          const last = route.points[route.points.length - 1];
          if (last) {
            const moved = distanceM(last[0], last[1], latitude, longitude);
            const gap = t - last[2];
            if (moved < MIN_STEP_M && !(gap >= MAX_GAP_MS && moved >= MIN_IDLE_STEP_M)) return prev;
          }
          const point: [number, number, number] = [
            Math.round(latitude * 1e5) / 1e5,
            Math.round(longitude * 1e5) / 1e5,
            t,
          ];
          return { ...prev, route: { ...route, points: [...route.points, point] } };
        });
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? 'Platsåtkomst nekad. Tillåt plats för sidan i webbläsarens inställningar.'
            : err.code === err.POSITION_UNAVAILABLE
              ? 'Ingen GPS-position tillgänglig just nu.'
              : 'GPS svarar inte – försöker igen.';
        setGeo({ error: message });
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [recording, active, updateState]);
}
