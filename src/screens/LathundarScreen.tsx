import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, ShieldAlert, FileText, CheckCircle2, 
  ChevronDown, ChevronRight, Truck, Car, GraduationCap,
  Download, Printer, Filter
} from 'lucide-react';
import { LATHUNDAR_DATA } from '../data/lathundarData';

export function LathundarScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDocId, setActiveDocId] = useState<string>('tdok-2018-0587');
  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>({
    'syfte': true,
    'mote': true,
    'kortid': true,
    'tung_syfte': true,
    'teori_inledning': true
  });

  const filteredDocs = useMemo(() => {
    return LATHUNDAR_DATA.filter(doc => {
      const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q) || doc.tdok.toLowerCase().includes(q);
      const matchSection = doc.sections.some(s => 
        s.title.toLowerCase().includes(q) || 
        s.content.toLowerCase().includes(q) ||
        (s.bullets && s.bullets.some(b => b.toLowerCase().includes(q)))
      );

      return matchTitle || matchSection;
    });
  }, [selectedCategory, searchQuery]);

  const activeDoc = useMemo(() => {
    return LATHUNDAR_DATA.find(d => d.id === activeDocId) || LATHUNDAR_DATA[0];
  }, [activeDocId]);

  const toggleSection = (id: string) => {
    setOpenSectionIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    activeDoc.sections.forEach(s => { allIds[s.id] = true; });
    setOpenSectionIds(allIds);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 h-full flex flex-col space-y-4">

      {/* Page Title & Intro */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="p-2.5 sm:p-3 bg-[#002f6c] text-white rounded-2xl shadow-sm shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Lathundar & Rutinbeskrivningar
              </h1>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                TDOK 2018:0587 / 0589 / 0583
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Officiella föreskrifter, bedömningskriterier, fordonskrav och ID-kontrollrutiner från Trafikverket.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => window.print()}
            className="min-h-10 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={15} />
            <span>Skriv ut</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px] flex-1">
        
        {/* Left Sidebar: Categories & Document Picker */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/60 p-3 sm:p-4 space-y-4 shrink-0 flex flex-col">

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök i lathundar..."
              className="w-full pl-9 pr-3 py-2.5 min-h-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1 mb-1">
              Kategori
            </div>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full px-3 py-2 min-h-10 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#002f6c] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Alla Dokument ({LATHUNDAR_DATA.length})
            </button>
            <button
              onClick={() => setSelectedCategory('korprov_grund')}
              className={`w-full px-3 py-2 min-h-10 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === 'korprov_grund'
                  ? 'bg-[#002f6c] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2"><Car size={14} /> Körprov B</span>
              <span className="text-[10px] opacity-75 font-mono">0587</span>
            </button>
            <button
              onClick={() => setSelectedCategory('korprov_tung')}
              className={`w-full px-3 py-2 min-h-10 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === 'korprov_tung'
                  ? 'bg-[#002f6c] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2"><Truck size={14} /> Tunga & Släp</span>
              <span className="text-[10px] opacity-75 font-mono">0589</span>
            </button>
            <button
              onClick={() => setSelectedCategory('teoriprov')}
              className={`w-full px-3 py-2 min-h-10 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                selectedCategory === 'teoriprov'
                  ? 'bg-[#002f6c] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2"><GraduationCap size={14} /> Teoriprov</span>
              <span className="text-[10px] opacity-75 font-mono">0583</span>
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-800 pt-3 flex-1 overflow-y-auto space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1 mb-1">
              Dokument
            </div>
            {filteredDocs.map((doc) => {
              const isActive = doc.id === activeDoc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 border-[#002f6c] dark:border-blue-500 shadow-sm ring-1 ring-[#002f6c] dark:ring-blue-500'
                      : 'bg-white/60 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#002f6c] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {doc.tdok}
                    </span>
                    <span className="text-[10px] text-gray-400">v{doc.version}</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 leading-snug">
                    {doc.title}
                  </h4>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Viewer */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6">
          
          <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-white bg-[#002f6c] px-3 py-1 rounded-lg">
                  {activeDoc.tdok}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Gäller fr.o.m {activeDoc.date} • Version {activeDoc.version}
                </span>
              </div>
              <button
                onClick={expandAll}
                className="px-3 py-1.5 min-h-9 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Visa allt
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {activeDoc.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {activeDoc.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {activeDoc.sections.map((section) => {
              const isOpen = openSectionIds[section.id] ?? true;

              return (
                <div 
                  key={section.id} 
                  className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/70 hover:bg-blue-50/50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h3>
                    <div className="text-gray-400 p-1">
                      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-slate-800">
                      <p>{section.content}</p>

                      {section.highlights && section.highlights.length > 0 && (
                        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900 rounded-xl space-y-1.5 text-amber-900 dark:text-amber-300">
                          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400">
                            <ShieldAlert size={15} />
                            <span>Viktig Regel & Föreskrift</span>
                          </div>
                          {section.highlights.map((hl, idx) => (
                            <p key={idx} className="font-semibold text-xs leading-normal">
                              • {hl}
                            </p>
                          ))}
                        </div>
                      )}

                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="space-y-2 pt-1">
                          {section.bullets.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#002f6c] dark:bg-blue-400 mt-1.5 shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.table && (
                        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-bold border-b border-gray-200 dark:border-slate-700">
                              <tr>
                                {section.table.headers.map((h, idx) => (
                                  <th key={idx} className="p-2.5">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                              {section.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className={`p-2.5 ${cIdx === 0 ? 'font-bold text-[#002f6c] dark:text-blue-400' : ''}`}>
                                      {cell}
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
          </div>

        </div>

      </div>

    </div>
  );
}
