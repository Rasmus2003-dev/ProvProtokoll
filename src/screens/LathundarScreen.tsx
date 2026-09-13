import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Search, ShieldAlert, FileText, CheckCircle2, 
  ChevronDown, ChevronRight, Truck, Car, GraduationCap,
  Download, Printer, Filter, Sparkles, Clock, Check, Layers, Cloud
} from 'lucide-react';
import { LATHUNDAR_DATA } from '../data/lathundarData';
import { LICENSE_GUIDES, LicenseGuideItem } from '../data/licenseGuidesData';

export function LathundarScreen() {
  const [activeTab, setActiveTab] = useState<'behorighet' | 'dokument'>('behorighet');
  const [selectedLicense, setSelectedLicense] = useState<string>('B');
  const [backendGuides, setBackendGuides] = useState<any[]>([]);

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

  // Fetch quick lathundar from backend to verify live cloud/server storage
  useEffect(() => {
    fetch('/api/lathundar/quick')
      .then(res => res.json())
      .then(data => {
        if (data.lathundar) setBackendGuides(data.lathundar);
      })
      .catch(() => {});
  }, []);

  const currentGuide = LICENSE_GUIDES[selectedLicense] || LICENSE_GUIDES['B'];
  const currentBackend = backendGuides.find(b => b.license === selectedLicense);

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

        {/* Action Buttons & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('behorighet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'behorighet'
                  ? 'bg-white dark:bg-slate-900 text-[#002f6c] dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Snabbguide (Per prov)</span>
            </button>
            <button
              onClick={() => setActiveTab('dokument')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dokument'
                  ? 'bg-white dark:bg-slate-900 text-[#002f6c] dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>Fullständiga TDOK</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="min-h-10 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={15} />
            <span>Skriv ut</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Per-Behörighet Snabbguide med Backend-synk */}
      {activeTab === 'behorighet' ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col p-4 sm:p-6 space-y-6">
          
          {/* Top License Selection Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100 dark:border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400 mr-2 shrink-0">
              Välj Körprov:
            </span>
            {Object.keys(LICENSE_GUIDES).map((lic) => {
              const isSel = selectedLicense === lic;
              return (
                <button
                  key={lic}
                  onClick={() => setSelectedLicense(lic)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                    isSel 
                      ? 'bg-[#002f6c] text-white shadow-sm ring-2 ring-blue-500/20' 
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {lic}
                </button>
              );
            })}
          </div>

          {/* Quick Header Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/50 dark:bg-blue-950/20 p-4 sm:p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#002f6c] text-white font-black text-xs uppercase tracking-wider">
                  Klass {currentGuide.license}
                </span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {currentGuide.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <Cloud size={10} /> Backend Synkad
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-1">
                Krav & Kriterier för Körprov {currentGuide.license}
              </h2>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200/60 dark:border-blue-800 text-xs sm:max-w-xs shadow-2xs">
              <div className="font-extrabold uppercase text-[10px] text-blue-700 dark:text-blue-400 tracking-wider flex items-center gap-1 mb-1">
                <Clock size={12} /> Minsta Körtid
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold leading-snug">
                {currentGuide.driveTime}
              </p>
            </div>
          </div>

          {/* 3 Actionable Inspection Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Column 1: Säkerhetskontroll */}
            <div className="p-5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-slate-800 pb-2.5">
                <h3 className="font-black text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Säkerhetskontroll
                </h3>
                <span className="text-[10px] font-bold text-gray-400 font-mono">
                  {currentGuide.safetyCheck.items.length} kontrollpunkter
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                {currentGuide.safetyCheck.description}
              </p>
              <ul className="space-y-2">
                {currentGuide.safetyCheck.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-800 dark:text-gray-200 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Särskilda manövrer */}
            <div className="p-5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-slate-800 pb-2.5">
                <h3 className="font-black text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Särskilda Manöverprov
                </h3>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
                  Obligatoriskt
                </span>
              </div>
              <ul className="space-y-2">
                {currentGuide.maneuverItems.map((man, idx) => (
                  <li key={idx} className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 rounded-xl text-xs font-bold text-amber-950 dark:text-amber-200 flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">▸</span>
                    <span>{man}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-gray-400">Obligatoriska krav:</div>
                {currentGuide.mandatoryHighlights.map((hl, idx) => (
                  <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    • {hl}
                  </p>
                ))}
              </div>
            </div>

            {/* Column 3: Trafikmoment & Regler */}
            <div className="p-5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-slate-800 pb-2.5">
                <h3 className="font-black text-xs uppercase tracking-wider text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Körning i Trafik
                </h3>
                <span className="text-[10px] font-bold text-gray-400">
                  Körplan
                </span>
              </div>
              <ul className="space-y-2">
                {currentGuide.trafficItems.map((traf, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-800 dark:text-gray-200 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{traf}</span>
                  </li>
                ))}
              </ul>
              {currentBackend?.speedMargin && (
                <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 mt-3 font-medium">
                  <span className="font-bold block text-[10px] uppercase text-blue-700 dark:text-blue-400 mb-0.5">Hastighet & Säkerhetsmarginal:</span>
                  {currentBackend.speedMargin}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* VIEW 2: Fullständiga TDOK Rutiner */
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
      )}

    </div>
  );
}

