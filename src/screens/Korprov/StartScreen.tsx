import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/ProvContext';
import { TEST_CONTENT } from '../../data/testContentCatalog';
import { User, FileText, ShieldCheck, ChevronRight, Users } from 'lucide-react';

const COMMON_LICENSES = ['B', 'BE', 'C', 'CE', 'D', 'DE', 'A', 'AM', 'TAXI'];

export function StartScreen() {
  const navigate = useNavigate();
  const { state, updateState, profile } = useAppStore();

  const {
    studentName,
    personalNumber,
    licenseType,
    examiner,
    testDate,
    email,
    testType,
    transmission
  } = state.properties;

  useEffect(() => {
    if (!studentName && !personalNumber) {
      updateState((prev) => ({
        ...prev,
        properties: {
          ...prev.properties,
          examiner: prev.properties.examiner || profile.name,
          testDate: prev.properties.testDate || new Date().toISOString().split('T')[0],
          testType: prev.properties.testType || 'Förstaprov',
          transmission: prev.properties.transmission || 'Manuell'
        }
      }));
    }
  }, [studentName, personalNumber, updateState, profile.name]);

  const handleUpdateProp = (field: keyof typeof state.properties, value: string) => {
    updateState((prev) => {
      const updatedProps = { ...prev.properties, [field]: value };
      let updatedTestItems = prev.includedTestItems;
      
      if (field === 'licenseType') {
        const items = TEST_CONTENT[value] || TEST_CONTENT['B'] || [];
        updatedTestItems = items;
      }
      
      return {
        ...prev,
        properties: updatedProps,
        includedTestItems: updatedTestItems
      };
    });
  };

  const setPresetCandidate = (candidate: {
    studentName: string;
    personalNumber: string;
    email: string;
    licenseType: string;
    examiner?: string;
  }) => {
    updateState((prev) => {
      const license = candidate.licenseType;
      const items = TEST_CONTENT[license] || TEST_CONTENT['B'] || [];
      return {
        ...prev,
        properties: {
          ...prev.properties,
          studentName: candidate.studentName,
          personalNumber: candidate.personalNumber,
          email: candidate.email,
          licenseType: license,
          examiner: candidate.examiner || prev.properties.examiner || profile.name,
          testType: 'Förstaprov',
          testDate: new Date().toISOString().split('T')[0]
        },
        checklist: {
          ...prev.checklist,
          identityChecked: true 
        },
        includedTestItems: items
      };
    });
  };

  const handleStartTest = () => {
    if (!studentName) handleUpdateProp('studentName', 'Kandidat');
    if (!licenseType) handleUpdateProp('licenseType', 'B');
    if (!state.checklist.identityChecked) {
        updateState(prev => ({
            ...prev,
            checklist: { ...prev.checklist, identityChecked: true }
        }));
    }
    navigate('/korprov/egenskaper');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full pt-6 pb-24 font-sans text-gray-900">
      
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Mottagning</h1>
          <p className="text-sm text-gray-500 mt-1">Registrera kandidat och provuppgifter för att starta provet.</p>
        </div>
        
        {/* Presets - subtle clean row */}
        <div className="flex flex-col gap-2 border border-blue-100 bg-blue-50/50 p-2 lg:p-3 pb-2 w-full md:w-auto">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-widest flex items-center gap-1.5">
            <Users size={12} /> Testkandidater (Demo)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Elvira (B)', name: 'Elvira Strömqvist', pin: '19950613-1234', type: 'B' },
              { label: 'Mikael (C)', name: 'Mikael Kronberg', pin: '19820209-4937', type: 'C' },
              { label: 'Fatima (D)', name: 'Fatima Al-Sayed', pin: '19900314-5566', type: 'D' },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => setPresetCandidate({
                  studentName: preset.name,
                  personalNumber: preset.pin,
                  email: `${preset.name.split(' ')[0].toLowerCase()}@exempel.se`,
                  licenseType: preset.type
                })}
                className="px-2.5 py-1 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm mb-6">
        {/* Section 1: Kandidatuppgifter */}
        <div className="p-5 sm:p-6 lg:p-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#D42220] mb-5 flex items-center gap-2">
            <User size={16} /> 1. Kandidatuppgifter
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Kandidatens namn *</label>
              <input
                type="text"
                value={studentName || ''}
                onChange={(e) => handleUpdateProp('studentName', e.target.value)}
                placeholder="Förnamn Efternamn"
                className="w-full h-11 px-3 text-[15px] border border-gray-300 focus:outline-none focus:border-[#D42220] focus:ring-1 focus:ring-[#D42220] bg-white transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Personnummer</label>
              <input
                type="text"
                value={personalNumber || ''}
                onChange={(e) => handleUpdateProp('personalNumber', e.target.value)}
                placeholder="ÅÅÅÅMMDD-XXXX"
                className="w-full h-11 px-3 text-[15px] border border-gray-300 focus:outline-none focus:border-[#D42220] focus:ring-1 focus:ring-[#D42220] bg-white transition-all font-mono"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">E-postadress (för protokoll)</label>
              <input
                type="email"
                value={email || ''}
                onChange={(e) => handleUpdateProp('email', e.target.value)}
                placeholder="namn@exempel.se"
                className="w-full h-11 px-3 text-[15px] border border-gray-300 focus:outline-none focus:border-[#D42220] focus:ring-1 focus:ring-[#D42220] bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full" />

        {/* Section 2: Provuppgifter */}
        <div className="p-5 sm:p-6 lg:p-8 bg-gray-50/50">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#D42220] mb-5 flex items-center gap-2">
            <FileText size={16} /> 2. Provuppgifter
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Provförrättare</label>
              <input
                type="text"
                value={examiner || ''}
                onChange={(e) => handleUpdateProp('examiner', e.target.value)}
                className="w-full h-11 px-3 text-[15px] border border-gray-300 focus:outline-none focus:border-[#D42220] focus:ring-1 focus:ring-[#D42220] bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Provdatum</label>
              <input
                type="date"
                value={testDate || ''}
                onChange={(e) => handleUpdateProp('testDate', e.target.value)}
                className="w-full h-11 px-3 text-[15px] border border-gray-300 focus:outline-none focus:border-[#D42220] focus:ring-1 focus:ring-[#D42220] bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Provtyp</label>
              <select
                value={testType || 'Förstaprov'}
                onChange={(e) => handleUpdateProp('testType', e.target.value)}
                className="w-full h-11 px-3 text-[15px] border border-gray-300 focus:outline-none focus:border-[#D42220] focus:ring-1 focus:ring-[#D42220] bg-white transition-all"
              >
                <option value="Förstaprov">Förstaprov</option>
                <option value="Omprov">Omprov</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Fordon / Växellåda</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateProp('transmission', 'Manuell')}
                  className={`flex-1 h-11 font-bold text-sm border transition-all ${
                    (transmission !== 'Automat')
                      ? 'bg-[#0052cc] text-white border-[#0052cc]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Manuell
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateProp('transmission', 'Automat')}
                  className={`flex-1 h-11 font-bold text-sm border transition-all ${
                    (transmission === 'Automat')
                      ? 'bg-[#0052cc] text-white border-[#0052cc]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Automat
                </button>
              </div>
            </div>
            
            <div className="space-y-3 md:col-span-2 pt-2">
              <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Behörighet</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_LICENSES.map((lic) => (
                  <button
                    key={lic}
                    type="button"
                    onClick={() => handleUpdateProp('licenseType', lic)}
                    className={`h-11 px-4 font-bold text-[15px] border transition-all select-none active:scale-95 ${
                      licenseType === lic
                        ? 'bg-[#D42220] text-white border-[#D42220]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {lic}
                  </button>
                ))}
                
                <input
                  type="text"
                  value={(!COMMON_LICENSES.includes(licenseType || '') && licenseType) ? licenseType : ''}
                  onChange={(e) => handleUpdateProp('licenseType', e.target.value.toUpperCase())}
                  placeholder="ANNAN..."
                  className="h-11 w-32 px-3 text-sm font-bold border border-gray-300 focus:outline-none focus:border-[#D42220] bg-white text-black uppercase transition-all placeholder:font-normal placeholder:normal-case"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-px bg-gray-100 w-full" />

        {/* Section 3: Identitetskontroll */}
        <div className="p-5 sm:p-6 lg:p-8">
           <h2 className="text-sm font-black uppercase tracking-widest text-[#D42220] mb-4 flex items-center gap-2">
            <ShieldCheck size={16} /> 3. Identitetskontroll
          </h2>
          
          <label className="flex items-start gap-4 p-4 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors select-none group">
             <div className="pt-0.5">
               <input 
                 type="checkbox" 
                 checked={state.checklist.identityChecked}
                 onChange={(e) => {
                   updateState(prev => ({
                     ...prev,
                     checklist: { ...prev.checklist, identityChecked: e.target.checked }
                   }))
                 }}
                 className="w-5 h-5 accent-[#D42220] cursor-pointer"
               />
             </div>
             <div>
               <div className="font-bold text-gray-900 group-hover:text-[#D42220] transition-colors">Identitet fastställd</div>
               <div className="text-sm text-gray-500 mt-1">
                 Giltig legitimation eller motsvarande identitetshandling har kontrollerats och namnteckningsprov utförts.
               </div>
             </div>
          </label>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div className="text-sm text-gray-500 font-medium">
          App-ID: <span className="font-mono">{personalNumber || 'Väntar...'}</span>
        </div>
        <button
          onClick={handleStartTest}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#0052cc] hover:bg-[#0043a8] active:scale-95 text-white font-bold text-[16px] tracking-wide uppercase transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span>Öppna prov</span>
          <ChevronRight size={20} />
        </button>
      </div>

    </div>
  );
}
