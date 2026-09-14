import { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Search, X, ShieldAlert, FileText, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronRight, Truck, Car, GraduationCap,
  Download, Printer, Compass, Check
} from 'lucide-react';
import { LATHUNDAR_DATA, LathundDocument } from '../data/lathundarData';
import { LICENSE_GUIDES, LicenseGuideItem } from '../data/licenseGuidesData';

interface LathundModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDocId?: string;
  defaultLicense?: string;
}

export function LathundModal({ isOpen, onClose, defaultDocId, defaultLicense = 'B' }: LathundModalProps) {
  const [activeTab, setActiveTab] = useState<'behorighet' | 'dokument'>('behorighet');
  const [selectedLicense, setSelectedLicense] = useState<string>(defaultLicense);

  useEffect(() => {
    if (defaultLicense) {
      setSelectedLicense(defaultLicense);
    }
  }, [defaultLicense]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDocId, setActiveDocId] = useState<string>(defaultDocId || 'tdok-2018-0587');
  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>({
    'syfte': true,
    'mote': true,
    'kortid': true,
    'tung_syfte': true,
    'teori_inledning': true
  });

  if (!isOpen) return null;

  const currentGuide = LICENSE_GUIDES[selectedLicense] || LICENSE_GUIDES['B'];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border-0 sm:border border-gray-200 dark:border-slate-800 w-full max-w-5xl h-[100dvh] sm:h-[92vh] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">

        {/* Header Bar */}
        <div className="bg-[#002f6c] text-white px-3 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-2 shrink-0 pt-safe">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-blue-600/40 rounded-xl border border-blue-400/30 shrink-0">
              <BookOpen className="w-5 h-5 text-blue-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-extrabold text-sm sm:text-base tracking-tight truncate">Provlathund för Inspektörer</h2>
                <span className="hidden sm:inline text-[10px] font-mono bg-blue-500/30 border border-blue-300/30 text-blue-100 px-2 py-0.5 rounded-full font-bold shrink-0">
                  TSFS & TDOK
                </span>
              </div>
              <p className="text-xs text-blue-200/90 hidden sm:block">
                Snabbguide över obligatoriska provmoment, körtid och säkerhetskontroll för varje behörighet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Per Behörighet vs TDOK */}
            <div className="flex bg-blue-950/60 p-1 rounded-xl border border-blue-400/30">
              <button
                onClick={() => setActiveTab('behorighet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'behorighet'
                    ? 'bg-white text-[#002f6c] shadow-xs'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Per Behörighet
              </button>
              <button
                onClick={() => setActiveTab('dokument')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'dokument'
                    ? 'bg-white text-[#002f6c] shadow-xs'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                TDOK Rutiner
              </button>
            </div>

            <button
              onClick={onClose}
              className="flex items-center justify-center min-w-10 min-h-10 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Stäng Lathund"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'behorighet' ? (
          /* ========================================================= */
          /* PER-BEHÖRIGHET LATHUND VIEW                               */
          /* ========================================================= */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Horizontal License Picker Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-2 sm:p-3 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
              <span className="text-[10px] font-black uppercase text-gray-400 px-2 shrink-0">Välj behörighet:</span>
              {Object.keys(LICENSE_GUIDES).map((lic) => {
                const isSelected = selectedLicense === lic;
                return (
                  <button
                    key={lic}
                    onClick={() => setSelectedLicense(lic)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#002f6c] text-white shadow-sm ring-2 ring-[#002f6c]/30 dark:ring-blue-500'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lic}
                  </button>
                );
              })}
            </div>

            {/* Guide Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Header Title Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-black text-sm">
                      Klass {currentGuide.license}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {currentGuide.name}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    Obligatoriska moment för {currentGuide.license}
                  </h3>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs sm:max-w-xs text-blue-950 dark:text-blue-200 font-medium">
                  <div className="font-extrabold uppercase text-[10px] text-blue-700 dark:text-blue-400 tracking-wider mb-0.5">Körtidskrav</div>
                  {currentGuide.driveTime}
                </div>
              </div>

              {/* Grid with 3 Key Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Column 1: Säkerhetskontroll */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-4 bg-emerald-500 rounded-full" />
                      <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                        Säkerhetskontroll
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                      {currentGuide.safetyCheck.items.length} moment
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {currentGuide.safetyCheck.description}
                  </p>
                  <ul className="space-y-2">
                    {currentGuide.safetyCheck.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-800 dark:text-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Särskilda manövrer */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-4 bg-amber-500 rounded-full" />
                      <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                        Särskilda Manövrer
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                      Obligatoriskt
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {currentGuide.maneuverItems.map((man, idx) => (
                      <li key={idx} className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-xl text-xs font-bold text-amber-950 dark:text-amber-200 flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">▸</span>
                        <span>{man}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Highlights box */}
                  <div className="mt-4 p-3.5 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-xl space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Skall beaktas:</div>
                    {currentGuide.mandatoryHighlights.map((hl, idx) => (
                      <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                        • {hl}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Column 3: Trafikmoment & Regler */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-4 bg-blue-500 rounded-full" />
                      <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                        Trafikkörning
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                      Helhetsbedömning
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {currentGuide.trafficItems.map((traf, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-800 dark:text-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{traf}</span>
                      </li>
                    ))}
                  </ul>

                  {currentGuide.notes && currentGuide.notes.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl space-y-1">
                      <div className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-400 tracking-wider">Omprovsregler:</div>
                      {currentGuide.notes.map((note, idx) => (
                        <p key={idx} className="text-[11.5px] text-blue-950 dark:text-blue-300 leading-relaxed font-medium">
                          {note}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* TDOK DOCUMENT BROWSER VIEW                                */
          /* ========================================================= */
          <>
            {/* Toolbar: Search & Categories */}
            <div className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">

              {/* Category Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 min-h-10 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-[#002f6c] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Alla Dokument
                </button>
                <button
                  onClick={() => setSelectedCategory('korprov_grund')}
                  className={`px-3 py-2 min-h-10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedCategory === 'korprov_grund'
                      ? 'bg-[#002f6c] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Car size={14} />
                  <span>Körprov B (TDOK 0587)</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('korprov_tung')}
                  className={`px-3 py-2 min-h-10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedCategory === 'korprov_tung'
                      ? 'bg-[#002f6c] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Truck size={14} />
                  <span>Tunga & Släp (TDOK 0589)</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('teoriprov')}
                  className={`px-3 py-2 min-h-10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedCategory === 'teoriprov'
                      ? 'bg-[#002f6c] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <GraduationCap size={14} />
                  <span>Teoriprov (TDOK 0583)</span>
                </button>
              </div>

              {/* Search Field */}
              <div className="relative sm:min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sök t.ex. backning, fusk, 25 min..."
                  className="w-full pl-9 pr-3 py-2.5 sm:py-1.5 min-h-10 sm:min-h-0 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

            </div>

            {/* Content Layout: Sidebar Document Selector & Main Viewer */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Document Cards List */}
          <div className="w-full md:w-80 max-h-40 md:max-h-none border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 p-3 overflow-y-auto space-y-2 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1 mb-1">
              Välj Lathund ({filteredDocs.length})
            </div>

            {filteredDocs.map((doc) => {
              const isActive = doc.id === activeDoc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 border-[#002f6c] dark:border-blue-500 shadow-md ring-1 ring-[#002f6c] dark:ring-blue-500'
                      : 'bg-white/70 dark:bg-slate-800/50 border-gray-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-bold text-[#002f6c] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {doc.tdok}
                    </span>
                    <span className="text-[10px] text-gray-400">v{doc.version}</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {doc.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Document Viewer */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-3 sm:p-6 overflow-y-auto space-y-6">
            
            {/* Active Document Header */}
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-white bg-[#002f6c] px-2.5 py-1 rounded-lg shadow-xs">
                    {activeDoc.tdok}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Gäller från {activeDoc.date} • Version {activeDoc.version}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={expandAll}
                    className="px-2.5 py-1.5 min-h-9 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Fäll ut alla
                  </button>
                </div>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">
                {activeDoc.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                {activeDoc.subtitle}
              </p>
            </div>

            {/* Document Sections */}
            <div className="space-y-4">
              {activeDoc.sections.map((section) => {
                const isOpen = openSectionIds[section.id] ?? true;

                return (
                  <div 
                    key={section.id} 
                    className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs"
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/70 hover:bg-blue-50/50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {section.title}
                      </h3>
                      <div className="text-gray-400 p-1">
                        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>

                    {/* Section Body */}
                    {isOpen && (
                      <div className="p-4 space-y-3.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-slate-800">
                        <p>{section.content}</p>

                        {/* Highlights Box */}
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

                        {/* Bullets List */}
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

                        {/* Structured Data Table if present */}
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
          </>
        )}

      </div>
    </div>
  );
}
