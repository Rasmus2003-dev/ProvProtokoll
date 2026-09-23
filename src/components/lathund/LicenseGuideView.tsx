import { useMemo, useState } from 'react';
import { Clock, Search, X, ShieldCheck, RotateCcw, Car, AlertTriangle, Info, Check } from 'lucide-react';
import { LICENSE_GUIDES, LicenseGuideItem } from '../../data/licenseGuidesData';
import { Highlight, matches } from './Highlight';

const CATEGORY_LABELS: Record<LicenseGuideItem['category'], string> = {
  bil: 'Bil',
  slap: 'Släp',
  lastbil: 'Lastbil',
  buss: 'Buss',
  mc: 'MC',
  yrke: 'Yrke',
  spar: 'Spår',
};

interface LicenseGuideViewProps {
  license: string;
  onLicenseChange: (license: string) => void;
  extraNote?: string;
}

type SectionKey = 'safety' | 'maneuver' | 'traffic';

export function LicenseGuideView({ license, onLicenseChange, extraNote }: LicenseGuideViewProps) {
  const guide = LICENSE_GUIDES[license] || LICENSE_GUIDES['B'];
  const [query, setQuery] = useState('');
  // Bockar för att hålla koll under provet – nollställs när behörighet byts
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const byCat = new Map<string, string[]>();
    Object.values(LICENSE_GUIDES).forEach(g => {
      const label = CATEGORY_LABELS[g.category] || 'Övrigt';
      byCat.set(label, [...(byCat.get(label) || []), g.license]);
    });
    return Array.from(byCat.entries());
  }, []);

  const selectLicense = (lic: string) => {
    onLicenseChange(lic);
    setChecked({});
  };

  const toggle = (key: string) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const sections: { key: SectionKey; title: string; subtitle: string; accent: string; dot: string; items: string[] }[] = [
    {
      key: 'safety',
      title: guide.safetyCheck.title || 'Säkerhetskontroll',
      subtitle: guide.safetyCheck.description,
      accent: 'border-t-emerald-500',
      dot: 'bg-emerald-500',
      items: guide.safetyCheck.items,
    },
    {
      key: 'maneuver',
      title: 'Särskilda manöverprov',
      subtitle: 'Obligatoriska manövrer för behörigheten.',
      accent: 'border-t-amber-500',
      dot: 'bg-amber-500',
      items: guide.maneuverItems,
    },
    {
      key: 'traffic',
      title: 'Körning i trafik',
      subtitle: 'Situationer som ska ingå i helhetsbedömningen.',
      accent: 'border-t-blue-500',
      dot: 'bg-blue-500',
      items: guide.trafficItems,
    },
  ];

  const totalItems = sections.reduce((n, s) => n + s.items.length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const highlights = guide.mandatoryHighlights.filter(h => matches(h, query));
  const notes = (guide.notes || []).filter(n => matches(n, query));

  return (
    <div className="space-y-5">
      {/* Behörighetsväljare, grupperad */}
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {groups.map(([label, licenses]) => (
          <div key={label} className="shrink-0">
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 px-0.5">{label}</div>
            <div className="flex gap-1.5">
              {licenses.map(lic => (
                <button
                  key={lic}
                  type="button"
                  onClick={() => selectLicense(lic)}
                  className={`min-w-11 h-10 px-3 rounded-xl text-sm font-black transition-all cursor-pointer ${
                    lic === guide.license
                      ? 'bg-[#002f6c] dark:bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lic}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rubrik + körtid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-stretch">
        <div className="rounded-2xl bg-gradient-to-br from-[#002f6c] to-[#00204a] text-white p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold">
              <Car size={14} /> {guide.name}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">Körprov {guide.license}</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-white/15">{guide.safetyCheck.items.length} kontrollpunkter</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/15">{guide.maneuverItems.length} manövrer</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/15">{guide.trafficItems.length} trafikmoment</span>
          </div>
        </div>
        <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 p-4 md:max-w-sm flex gap-3">
          <Clock size={22} className="text-[#002f6c] dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-800 dark:text-blue-300">Körtid</div>
            <p className="text-sm font-semibold text-blue-950 dark:text-blue-100 leading-snug mt-0.5">
              <Highlight text={guide.driveTime} query={query} />
            </p>
          </div>
        </div>
      </div>

      {/* Sök + bockräknare */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Sök i lathunden för ${guide.license}...`}
            className="w-full h-11 pl-10 pr-10 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer" aria-label="Rensa sökning">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 h-11 px-3.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 shrink-0">
          <Check size={14} className="text-emerald-600" />
          {totalChecked} / {totalItems} avbockade
          {totalChecked > 0 && (
            <button type="button" onClick={() => setChecked({})} className="ml-1 p-1 rounded-md text-gray-400 hover:text-gray-700 cursor-pointer" title="Nollställ bockar">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Viktiga krav – alltid synliga överst */}
      {highlights.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <AlertTriangle size={15} /> Måste ingå
          </div>
          <ul className="space-y-1.5">
            {highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm font-semibold text-amber-950 dark:text-amber-100 leading-snug">
                <span className="text-amber-600 shrink-0">▸</span>
                <span><Highlight text={h} query={query} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tre checklistor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {sections.map((section, sIdx) => {
          const visible = section.items
            .map((item, idx) => ({ item, key: `${guide.license}-${section.key}-${idx}` }))
            .filter(({ item }) => matches(item, query));
          const done = section.items.filter((_, idx) => checked[`${guide.license}-${section.key}-${idx}`]).length;
          if (query && visible.length === 0) return null;
          return (
            <div key={section.key} className={`rounded-2xl border border-gray-200 dark:border-slate-800 border-t-4 ${section.accent} bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3 shadow-xs`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Del {sIdx + 1}</div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">{section.title}</h3>
                </div>
                <span className={`text-[11px] font-black px-2 py-1 rounded-lg shrink-0 ${
                  done === section.items.length && done > 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {done}/{section.items.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{section.subtitle}</p>
              <ul className="space-y-1.5">
                {visible.map(({ item, key }) => {
                  const isChecked = Boolean(checked[key]);
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                            : 'bg-gray-50/60 dark:bg-slate-800/40 border-transparent hover:border-gray-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}>
                          {isChecked && <Check size={12} strokeWidth={3.5} />}
                        </span>
                        <span className={`text-sm leading-snug ${isChecked ? 'text-gray-500 dark:text-slate-400 line-through decoration-gray-300' : 'text-gray-800 dark:text-gray-100 font-medium'}`}>
                          <Highlight text={item} query={query} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Omprov & anmärkningar */}
      {(notes.length > 0 || extraNote) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.length > 0 && (
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-800 dark:text-blue-300">
                <Info size={14} /> Bra att veta / omprov
              </div>
              {notes.map((n, i) => (
                <p key={i} className="text-sm text-blue-950 dark:text-blue-100 leading-snug">• <Highlight text={n} query={query} /></p>
              ))}
            </div>
          )}
          {extraNote && (
            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-slate-300">
                <ShieldCheck size={14} /> Hastighet & säkerhetsmarginal
              </div>
              <p className="text-sm text-gray-800 dark:text-slate-200 leading-snug">{extraNote}</p>
            </div>
          )}
        </div>
      )}

      {query && highlights.length === 0 && notes.length === 0 && sections.every(s => !s.items.some(i => matches(i, query))) && !matches(guide.driveTime, query) && (
        <p className="text-sm text-center text-gray-500 dark:text-slate-400 py-6">Inga träffar för "{query}" i lathunden för {guide.license}.</p>
      )}
    </div>
  );
}
