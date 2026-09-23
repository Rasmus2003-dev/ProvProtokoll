import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronDown, ChevronRight, ShieldAlert, Car, Truck, GraduationCap, Layers } from 'lucide-react';
import { LATHUNDAR_DATA, LathundDocument } from '../../data/lathundarData';
import { Highlight, matchesAny, useSlashFocus, useStoredState } from './Highlight';

type Section = LathundDocument['sections'][number];

function sectionMatches(section: Section, query: string): boolean {
  return matchesAny([
    section.title,
    section.content,
    ...(section.bullets || []),
    ...(section.highlights || []),
    ...(section.table?.rows || []).flat(),
  ], query);
}

// Vilken rutinbeskrivning som hör till en behörighet
export function docForLicense(license?: string): string {
  if (!license) return 'tdok-2018-0587';
  if (license === 'A' || license.startsWith('A')) return 'tdok-2018-0588';
  if (['B96', 'BE', 'C', 'C1', 'CE', 'C1E', 'D', 'D1', 'DE', 'D1E'].includes(license)) return 'tdok-2018-0589';
  return 'tdok-2018-0587';
}

const CATEGORIES: { id: 'all' | LathundDocument['category']; label: string; icon: typeof Car }[] = [
  { id: 'all', label: 'Alla', icon: Layers },
  { id: 'korprov_grund', label: 'Körprov', icon: Car },
  { id: 'korprov_tung', label: 'Tunga & släp', icon: Truck },
  { id: 'teoriprov', label: 'Teoriprov', icon: GraduationCap },
];

interface TdokViewerProps {
  defaultDocId?: string;
}

export function TdokViewer({ defaultDocId }: TdokViewerProps) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const [query, setQuery] = useState('');
  // Senast öppnade dokument kommer ihåg, om inget särskilt dokument begärs
  const [storedDocId, setStoredDocId] = useStoredState('lathund-doc', 'tdok-2018-0587');
  const [activeDocId, setActiveDocIdState] = useState(defaultDocId || storedDocId);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const articleRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  useEffect(() => { if (defaultDocId) setActiveDocIdState(defaultDocId); }, [defaultDocId]);

  const setActiveDocId = (id: string) => {
    setActiveDocIdState(id);
    setStoredDocId(id);
    // På mobil ligger dokumentet under listan – hoppa ner till det
    if (window.matchMedia('(max-width: 767px)').matches) {
      requestAnimationFrame(() => articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  const docs = useMemo(() => LATHUNDAR_DATA.filter(doc =>
    (category === 'all' || doc.category === category) &&
    (!query.trim() || matchesAny([doc.title, doc.tdok, doc.subtitle], query) || doc.sections.some(s => sectionMatches(s, query)))
  ), [category, query]);

  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0] || null;
  // Träff i dokumentets rubrik visar alla avsnitt
  const docTitleHit = activeDoc ? matchesAny([activeDoc.title, activeDoc.tdok, activeDoc.subtitle], query) : false;
  const visibleSections = activeDoc ? activeDoc.sections.filter(s => docTitleHit || sectionMatches(s, query)) : [];
  const searching = query.trim().length > 0;

  const setAll = (value: boolean) => {
    if (!activeDoc) return;
    const next: Record<string, boolean> = {};
    activeDoc.sections.forEach(s => { next[s.id] = value; });
    setCollapsed(next);
  };

  const jumpTo = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: false }));
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-0 flex-1">
      {/* Dokumentlista */}
      <aside className="md:w-72 shrink-0 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape' && query) { e.stopPropagation(); setQuery(''); } }}
            placeholder="Sök t.ex. backning, fusk, 25 min..."
            className="w-full h-11 pl-10 pr-10 text-sm [&::-webkit-search-cancel-button]:hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer" aria-label="Rensa sökning">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={`h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                category === id ? 'bg-[#002f6c] dark:bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {docs.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400 py-2">Inga dokument matchar.</p>}
          {docs.map(doc => {
            const active = doc.id === activeDoc?.id;
            const hits = searching ? doc.sections.filter(s => sectionMatches(s, query)).length : 0;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setActiveDocId(doc.id)}
                className={`text-left min-w-56 md:min-w-0 p-3 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-slate-800 border-[#002f6c] dark:border-blue-500 ring-1 ring-[#002f6c] dark:ring-blue-500 shadow-sm'
                    : 'bg-white/70 dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#002f6c] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">{doc.tdok}</span>
                  {searching && hits > 0 && (
                    <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 bg-yellow-100 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded">{hits} träff{hits > 1 ? 'ar' : ''}</span>
                  )}
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                  <Highlight text={doc.title} query={query} />
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Dokumentvisare */}
      {activeDoc && (
        <article ref={articleRef} className="flex-1 min-w-0 space-y-4 scroll-mt-4">
          <header className="space-y-2 pb-3 border-b border-gray-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-black text-white bg-[#002f6c] dark:bg-blue-600 px-2.5 py-1 rounded-lg">{activeDoc.tdok}</span>
                <span className="text-gray-500 dark:text-slate-400">Version {activeDoc.version} · {activeDoc.date}</span>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setAll(false)} className="h-8 px-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-200 cursor-pointer">Fäll ut alla</button>
                <button type="button" onClick={() => setAll(true)} className="h-8 px-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-200 cursor-pointer">Fäll ihop alla</button>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{activeDoc.title}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300">{activeDoc.subtitle}</p>

            {/* Innehållsförteckning */}
            {!searching && activeDoc.sections.length > 2 && (
              <nav className="flex flex-wrap gap-1.5 pt-1" aria-label="Innehåll">
                {activeDoc.sections.map(s => (
                  <button key={s.id} type="button" onClick={() => jumpTo(s.id)} className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-[11px] font-semibold text-gray-600 dark:text-slate-300 hover:border-[#002f6c] hover:text-[#002f6c] dark:hover:text-blue-400 cursor-pointer">
                    {s.title}
                  </button>
                ))}
              </nav>
            )}
            {searching && (
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Visar {visibleSections.length} av {activeDoc.sections.length} avsnitt som matchar "{query}".
              </p>
            )}
          </header>

          {visibleSections.map(section => {
            // Vid sökning är träffade avsnitt alltid utfällda
            const isOpen = searching || !collapsed[section.id];
            return (
              <div
                key={section.id}
                ref={el => { sectionRefs.current[section.id] = el; }}
                className="scroll-mt-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setCollapsed(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left bg-gray-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white"><Highlight text={section.title} query={query} /></h3>
                  <span className="text-gray-400 shrink-0">{isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 space-y-3.5 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                    <p><Highlight text={section.content} query={query} /></p>

                    {section.highlights && section.highlights.length > 0 && (
                      <div className="p-3.5 rounded-xl border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-300">
                          <ShieldAlert size={14} /> Viktigt
                        </div>
                        {section.highlights.map((hl, i) => (
                          <p key={i} className="text-sm font-semibold text-amber-950 dark:text-amber-100 leading-snug">
                            <Highlight text={hl.replace(/^CRITICAL:\s*/, '')} query={query} />
                          </p>
                        ))}
                      </div>
                    )}

                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="space-y-2">
                        {section.bullets.map((b, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#002f6c] dark:bg-blue-400 mt-2 shrink-0" />
                            <span><Highlight text={b} query={query} /></span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.table && (
                      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white">
                            <tr>{section.table.headers.map((h, i) => <th key={i} className="p-2.5 font-bold whitespace-nowrap">{h}</th>)}</tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {section.table.rows.map((row, r) => (
                              <tr key={r} className="odd:bg-white even:bg-gray-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-800/30">
                                {row.map((cell, c) => (
                                  <td key={c} className={`p-2.5 align-top ${c === 0 ? 'font-bold text-[#002f6c] dark:text-blue-400 whitespace-nowrap' : ''}`}>
                                    <Highlight text={cell} query={query} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </article>
      )}
    </div>
  );
}
