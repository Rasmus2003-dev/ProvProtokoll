import { useMemo, useRef, useState } from 'react';
import { Clock, Search, X, ShieldCheck, RotateCcw, Car, AlertTriangle, Info, Check, Eye, EyeOff } from 'lucide-react';
import { LICENSE_GUIDES, LicenseGuideItem } from '../../data/licenseGuidesData';
import { Highlight, matches, useSlashFocus, useStoredState } from './Highlight';
import { docForLicense } from './TdokViewer';
import { LATHUNDAR_DATA } from '../../data/lathundarData';

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
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);
  // Bockar för att hålla koll under provet – sparas per behörighet under sessionen,
  // så att de finns kvar om lathunden stängs och öppnas igen
  const [checked, setChecked] = useStoredState<Record<string, boolean>>('lathund-checks', {}, 'session');
  const [hideDone, setHideDone] = useStoredState('lathund-hide-done', false);
  const prefix = `${guide.license}-`;

  const groups = useMemo(() => {
    const byCat = new Map<string, string[]>();
    Object.values(LICENSE_GUIDES).forEach(g => {
      const label = CATEGORY_LABELS[g.category] || 'Övrigt';
      byCat.set(label, [...(byCat.get(label) || []), g.license]);
    });
    return Array.from(byCat.entries());
  }, []);

  // Behörigheter med påbörjad checklista markeras med en prick
  const startedLicenses = useMemo(
    () => new Set(Object.keys(checked).map(k => k.slice(0, k.lastIndexOf('-', k.lastIndexOf('-') - 1)))),
    [checked]
  );

  const selectLicense = (lic: string) => onLicenseChange(lic);

  const toggle = (key: string) => setChecked(prev => {
    const next = { ...prev };
    if (next[key]) delete next[key]; else next[key] = true;
    return next;
  });

  // Nollställer bara bockarna för den valda behörigheten
  const resetCurrent = () => setChecked(prev =>
    Object.fromEntries(Object.entries(prev).filter(([k]) => !k.startsWith(prefix)))
  );

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
  const totalChecked = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
  const progress = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;
  const highlights = guide.mandatoryHighlights.filter(h => matches(h, query));
  const notes = (guide.notes || []).filter(n => matches(n, query));

  return (
    <div className="space-y-5">
      {/* Behörighetsväljare, grupperad */}
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {groups.map(([label, licenses]) => (
          <div key={label} className="shrink-0">
            <div className="text-[11px] font-bold text-gray-400 mb-1 px-0.5">{label}</div>
            <div className="flex gap-1.5">
              {licenses.map(lic => (
                <button
                  key={lic}
                  type="button"
                  onClick={() => selectLicense(lic)}
                  aria-pressed={lic === guide.license}
                  title={startedLicenses.has(lic) ? `${lic} – påbörjad checklista` : LICENSE_GUIDES[lic]?.name}
                  className={`relative min-w-11 h-10 px-3 rounded-control text-sm font-bold transition-all cursor-pointer ${
                    lic === guide.license
                      ? 'bg-[#002f6c] dark:bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lic}
                  {startedLicenses.has(lic) && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dokumenthuvud i TDOK-stil */}
      {(() => {
        const base = LATHUNDAR_DATA.find(d => d.id === docForLicense(guide.license));
        const meta: [string, string][] = [
          ['Dokumenttyp', 'Lathund'],
          ['Dokumentdatum', '2026-09-01'],
          ['Behörighet', `${guide.license} – ${guide.name}`],
          ['Version', '1.0'],
          ['Bygger på', base ? `${base.tdok}, ${base.title}` : 'Rutinbeskrivning för körprov'],
          ['Gäller för', 'Förarprövare'],
        ];
        return (
          <header className="rounded-card border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-300 dark:border-slate-700">
              <div>
                <p className="text-[12px] font-semibold text-gray-500 dark:text-slate-400">ProvProtokoll · Lathund</p>
                <h2 className="text-2xl sm:text-[28px] font-bold text-gray-950 dark:text-white leading-tight mt-0.5">Körprov {guide.license}</h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">Kort sammanfattning att ha med i bilen. Vid tveksamhet gäller rutinbeskrivningen.</p>
              </div>
              <Car size={22} className="text-gray-400 shrink-0 mt-1" />
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 text-[13px]">
              {meta.map(([k, v], i) => (
                <div key={k} className={`px-5 py-2.5 border-gray-200 dark:border-slate-800 ${i < meta.length - 2 ? 'border-b' : ''} ${i % 2 === 0 ? 'sm:border-r' : ''}`}>
                  <dt className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">{k}</dt>
                  <dd className="font-medium text-gray-900 dark:text-slate-100">{v}</dd>
                </div>
              ))}
            </dl>
          </header>
        );
      })()}

      {/* Sök + bockräknare */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape' && query) { e.stopPropagation(); setQuery(''); } }}
            placeholder={`Sök i lathunden för ${guide.license}...`}
            className="w-full h-11 pl-10 pr-10 text-sm [&::-webkit-search-cancel-button]:hidden rounded-control border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer" aria-label="Rensa sökning">
              <X size={15} />
            </button>
          ) : (
            <kbd className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700 text-[11px] tabular-nums text-gray-400 pointer-events-none">/</kbd>
          )}
        </div>
        <div className="flex gap-2 shrink-0 print:hidden">
          <div className="relative flex items-center gap-2 h-11 px-3.5 rounded-control bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 overflow-hidden flex-1 sm:flex-none">
            <span className="absolute inset-y-0 left-0 bg-emerald-500/15 transition-all" style={{ width: `${progress}%` }} aria-hidden />
            <Check size={14} className="text-emerald-600 relative" />
            <span className="relative">{totalChecked} / {totalItems} avbockade</span>
            {totalChecked > 0 && (
              <button type="button" onClick={resetCurrent} className="relative ml-1 p-1 rounded-md text-gray-400 hover:text-gray-700 cursor-pointer" title={`Nollställ bockar för ${guide.license}`}>
                <RotateCcw size={13} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setHideDone(v => !v)}
            aria-pressed={hideDone}
            className={`h-11 px-3 rounded-control text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              hideDone ? 'bg-[#002f6c] dark:bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
            title="Visa bara det som återstår"
          >
            {hideDone ? <EyeOff size={14} /> : <Eye size={14} />} Bara kvar
          </button>
        </div>
      </div>

      {/* Dokumentets avsnitt, numrerade som i en rutinbeskrivning */}
      <article className="rounded-card border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 sm:px-8 py-6 space-y-8 text-[15px] text-gray-800 dark:text-slate-200 leading-relaxed">
        {(!query || matches(guide.driveTime, query)) && (
          <section>
            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex gap-3 font-sans tracking-normal"><span className="tabular-nums text-gray-400">1</span> Körtid och omfattning</h3>
            <p className="mt-2 flex gap-2.5"><Clock size={17} className="text-gray-400 shrink-0 mt-1" /><span><Highlight text={guide.driveTime} query={query} /></span></p>
          </section>
        )}

        {highlights.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex gap-3 font-sans tracking-normal"><span className="tabular-nums text-gray-400">2</span> Detta måste ingå</h3>
            <div className="mt-2 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 space-y-1.5">
              {highlights.map((h, i) => (
                <p key={i} className="flex gap-2.5 font-semibold text-amber-950 dark:text-amber-100">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-1" />
                  <span><Highlight text={h} query={query} /></span>
                </p>
              ))}
            </div>
          </section>
        )}

        {sections.map((section, sIdx) => {
          const num = sIdx + 3;
          const visible = section.items
            .map((item, idx) => ({ item, idx, key: `${guide.license}-${section.key}-${idx}` }))
            .filter(({ item, key }) => matches(item, query) && !(hideDone && checked[key]));
          const done = section.items.filter((_, idx) => checked[`${guide.license}-${section.key}-${idx}`]).length;
          if (query && visible.length === 0) return null;
          return (
            <section key={section.key}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold text-gray-950 dark:text-white flex gap-3 font-sans tracking-normal"><span className="tabular-nums text-gray-400">{num}</span> {section.title}</h3>
                <span className="text-[12px] font-semibold text-gray-500 dark:text-slate-400 tabular-nums shrink-0">{done} av {section.items.length}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">{section.subtitle}</p>
              {visible.length === 0 && done === section.items.length && done > 0 && (
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><Check size={15} strokeWidth={3} /> Allt avbockat</p>
              )}
              <ol className="mt-3 divide-y divide-gray-100 dark:divide-slate-800 border-y border-gray-100 dark:border-slate-800">
                {visible.map(({ item, idx, key }) => {
                  const isChecked = Boolean(checked[key]);
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        aria-pressed={isChecked}
                        className="w-full text-left flex items-start gap-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/40"
                      >
                        <span className="tabular-nums text-[13px] text-gray-400 w-8 shrink-0 pt-0.5">{num}.{idx + 1}</span>
                        <span className={`flex-1 ${isChecked ? 'text-gray-400 dark:text-slate-500 line-through decoration-gray-300' : ''}`}>
                          <Highlight text={item} query={query} />
                        </span>
                        <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-slate-600'
                        }`}>
                          {isChecked && <Check size={12} strokeWidth={3.5} />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

        {(notes.length > 0 || extraNote) && (
          <section>
            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex gap-3 font-sans tracking-normal"><span className="tabular-nums text-gray-400">{sections.length + 3}</span> Bra att veta</h3>
            <ul className="mt-2 space-y-1.5">
              {notes.map((n, i) => (
                <li key={i} className="flex gap-2.5"><Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" /><span><Highlight text={n} query={query} /></span></li>
              ))}
              {extraNote && (
                <li className="flex gap-2.5"><ShieldCheck size={16} className="text-gray-500 shrink-0 mt-1" /><span>{extraNote}</span></li>
              )}
            </ul>
          </section>
        )}
      </article>

      {query && highlights.length === 0 && notes.length === 0 && sections.every(s => !s.items.some(i => matches(i, query))) && !matches(guide.driveTime, query) && (
        <p className="text-sm text-center text-gray-500 dark:text-slate-400 py-6">Inga träffar för "{query}" i lathunden för {guide.license}.</p>
      )}
    </div>
  );
}
