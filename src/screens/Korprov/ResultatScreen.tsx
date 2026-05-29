import { useNavigate } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/ProvContext';
import { FailureForm } from './components/FailureForm';

export function ResultatScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();

  const licenseType = state.properties.licenseType || 'B';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];

  const [autoPrefill, setAutoPrefill] = useState<boolean>(() => {
    const saved = localStorage.getItem('auto_prefill_test');
    return saved === null ? true : saved === 'true'; // Default to true!
  });

  const handleToggleAutoPrefill = (val: boolean) => {
    setAutoPrefill(val);
    localStorage.setItem('auto_prefill_test', String(val));
    
    // Proactively fill currently underkänd items if toggling on
    if (val) {
      updateState((prev) => {
        const newState = { ...prev };
        if (newState.result.drivingResult === 'Underkänt') {
          const currentFail = newState.result.drivingFailure;
          if (!currentFail.primaryCause.area) {
            newState.result.drivingFailure = {
              ...currentFail,
              primaryCause: {
                area: 'Trafiksäkerhet och beteende',
                deficiencies: ['Anpassa hastigheten efter de omständigheter som råder']
              },
              situations: ['Mörkerkörning']
            };
          }
        }
        if (newState.result.safetyCheckResult === 'Underkänt') {
          const currentFail = newState.result.safetyCheckFailure;
          if (!currentFail.primaryCause.area) {
            newState.result.safetyCheckFailure = {
              ...currentFail,
              primaryCause: {
                area: 'Fordonskännedom',
                deficiencies: ['Utföra kontroller på fordonet']
              }
            };
          }
        }
        return newState;
      });
    }
  };

  const handleNext = () => {
    navigate('/korprov/protokoll');
  };

  const updateResult = (field: keyof typeof state.result, value: any) => {
    updateState((prev) => {
      const newState = { ...prev };
      newState.result = { ...newState.result, [field]: value };
      
      // If auto-prefill is turned on, and they just underkände something that is empty, fill it with default test data
      if (autoPrefill) {
        if (field === 'drivingResult' && value === 'Underkänt') {
          const currentFail = newState.result.drivingFailure;
          if (!currentFail.primaryCause.area || currentFail.primaryCause.area === '') {
            newState.result.drivingFailure = {
              ...currentFail,
              primaryCause: {
                area: 'Trafiksäkerhet och beteende',
                deficiencies: ['Anpassa hastigheten efter de omständigheter som råder']
              },
              situations: ['Mörkerkörning']
            };
          }
        }
        
        if (field === 'safetyCheckResult' && value === 'Underkänt') {
          const currentFail = newState.result.safetyCheckFailure;
          if (!currentFail.primaryCause.area || currentFail.primaryCause.area === '') {
            newState.result.safetyCheckFailure = {
              ...currentFail,
              primaryCause: {
                area: 'Fordonskännedom',
                deficiencies: ['Utföra kontroller på fordonet']
              }
            };
          }
        }
      }
      
      return newState;
    });
  };

  const OptionButton = ({ 
    active, onClick, children, variant = 'default', badge
  }: { 
    active: boolean, onClick: () => void, children: ReactNode, variant?: 'default' | 'danger' | 'success', badge?: string 
  }) => {
    let colors = 'bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50/50 shadow-sm';
    if (active) {
      if (variant === 'danger') {
        colors = 'bg-red-50/70 dark:bg-red-950/20 text-[#c62828] dark:text-[#ff6b6b] border-[#c62828] dark:border-red-800 font-bold shadow-md';
      } else if (variant === 'success') {
        colors = 'bg-[#e6f4ea] dark:bg-emerald-950/20 text-[#1e8e3e] dark:text-[#5acc82] border-[#1e8e3e] dark:border-emerald-800 font-bold shadow-md';
      } else {
        colors = 'bg-[#e8f0fe] dark:bg-blue-950/20 text-[#1a73e8] dark:text-[#75a6ff] border-[#1a73e8] dark:border-blue-800 font-bold shadow-md';
      }
    }
    
    return (
      <button
        onClick={onClick}
        type="button"
        className={`px-4 py-3.5 border text-sm w-full flex items-center justify-between transition-all duration-150 rounded-xl cursor-pointer select-none active:scale-[0.98] ${colors}`}
      >
        <div className="flex items-center gap-3">
          {variant === 'success' && (
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-xs transition-colors ${active ? 'border-[#1e8e3e] bg-[#1e8e3e] text-white' : 'border-gray-300 text-transparent'}`}>
              ✓
            </div>
          )}
          {variant === 'danger' && (
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-xs transition-colors ${active ? 'border-[#c62828] bg-[#c62828] text-white' : 'border-gray-300 text-transparent'}`}>
              ✗
            </div>
          )}
          {variant === 'default' && (
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${active ? 'border-[#1a73e8] bg-[#1a73e8]' : 'border-gray-300'}`}>
              {active && <div className="w-2 h-2 rounded-full bg-white shrink-0" />}
            </div>
          )}
          <span className="tracking-tight font-semibold text-[14px]">{children}</span>
        </div>
        {badge && (
          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${active ? 'bg-current/10' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 px-4 sm:px-6 pb-24">
      {/* Title block */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mt-4 sm:mt-8">
        <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-gray-900 dark:text-white uppercase">Beslutsunderlag</h2>
        <div className="w-12 h-1 bg-[#c40000] mx-auto my-2 rounded-full" />
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base leading-relaxed">
          Fastställ provets slutgiltiga resultat utifrån den systematiska helhetsbedömningen av förarprovet.
        </p>
      </div>

      {/* Auto Test Prefill Switch Control */}
      <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white dark:from-slate-900/60 dark:via-blue-950/10 dark:to-slate-950 border border-blue-100 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm animate-fade-in print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100/80 dark:bg-blue-900/30 rounded-xl text-[#1a73e8] dark:text-blue-400 shrink-0">
            <svg className="w-5 h-5 stroke-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Auto-testfyllning av grundorsak
              <span className="text-[10px] bg-blue-150 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider">Demo Helper</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Prefyller automatiskt en giltig test-grundorsak när ett prov underkänns. Kan stängas av.</p>
          </div>
        </div>
        <button
          onClick={() => handleToggleAutoPrefill(!autoPrefill)}
          aria-label="Toggle auto prefill"
          className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/35 ${
            autoPrefill ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-800'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
              autoPrefill ? 'translate-x-5.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start mt-6">
        {/* Left main pane */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Driving Status */}
          <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50 via-white to-white dark:from-slate-900/40 dark:to-slate-950/20 py-3.5 px-5 flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-[#c40000] rounded-full shrink-0" />
              <h3 className="text-xs font-black text-gray-950 dark:text-gray-200 uppercase tracking-widest">Körning på väg - Körning</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OptionButton 
                  active={state.result.drivingResult === 'Godkänt'} 
                  onClick={() => updateResult('drivingResult', 'Godkänt')}
                  variant="success"
                  badge="G"
                >
                  Godkänd
                </OptionButton>
                <OptionButton 
                  active={state.result.drivingResult === 'Underkänt'} 
                  onClick={() => updateResult('drivingResult', 'Underkänt')}
                  variant="danger"
                  badge="U"
                >
                  Underkänd
                </OptionButton>
              </div>
            </div>
          </div>

          {/* If Failed on Driving */}
          {state.result.drivingResult === 'Underkänt' && (
            <div className="animate-fade-in">
              <FailureForm 
                title="Bristförteckning – Körning"
                data={state.result.drivingFailure}
                onChange={(data) => updateResult('drivingFailure', data)}
                type="driving"
              />
            </div>
          )}

          {/* Heavy licenses or safety check mandatory (B, B96, BE, Heavy) */}
          {(HEAVY_LICENSES.includes(licenseType) || ['B', 'B96', 'BE'].includes(licenseType)) && (
            <>
              <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50 via-white to-white dark:from-slate-900/40 dark:to-slate-950/20 py-3.5 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-4 bg-[#c40000] rounded-full shrink-0" />
                    <h3 className="text-xs font-black text-gray-950 dark:text-gray-200 uppercase tracking-widest">Säkerhetskontroll</h3>
                  </div>
                  <span className="text-[10px] font-black text-[#1a73e8] dark:text-blue-300 bg-[#e8f0fe] dark:bg-blue-900/30 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Obligatorisk
                  </span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <OptionButton 
                      active={state.result.safetyCheckResult === 'Godkänt'} 
                      onClick={() => updateResult('safetyCheckResult', 'Godkänt')}
                      variant="success"
                    >
                      Godkod
                    </OptionButton>
                    <OptionButton 
                      active={state.result.safetyCheckResult === 'Underkänt'} 
                      onClick={() => updateResult('safetyCheckResult', 'Underkänt')}
                      variant="danger"
                    >
                      Underkänd
                    </OptionButton>
                    <div className="col-span-2 sm:col-span-1">
                      <OptionButton 
                        active={state.result.safetyCheckResult === '-'} 
                        onClick={() => updateResult('safetyCheckResult', '-')}
                      >
                        Ej genomförd
                      </OptionButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Failure on safety check */}
              {state.result.safetyCheckResult === 'Underkänt' && (
                <div className="animate-fade-in">
                  <FailureForm 
                    title="Bristförteckning – Säkerhetskontroll"
                    data={state.result.safetyCheckFailure}
                    onChange={(data) => updateResult('safetyCheckFailure', data)}
                    type="safety"
                  />
                </div>
              )}
            </>
          )}

          {/* Intervention and Aborted states */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Intervention Card */}
            <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50 via-white to-white dark:from-slate-900/40 dark:to-slate-950/20 py-3.5 px-5 flex items-center gap-2.5">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full shrink-0" />
                <span className="font-black text-gray-950 dark:text-gray-200 text-xs uppercase tracking-widest">Ingripande</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3.5">
                  <OptionButton 
                    active={!state.result.interventionOccurred} 
                    onClick={() => updateResult('interventionOccurred', false)}
                  >
                    Nej
                  </OptionButton>
                  <OptionButton 
                    active={state.result.interventionOccurred} 
                    onClick={() => updateResult('interventionOccurred', true)}
                    variant="danger"
                  >
                    Ja (Risk)
                  </OptionButton>
                </div>
              </div>
            </div>

            {/* Aborted Card */}
            <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50 via-white to-white dark:from-slate-900/40 dark:to-slate-950/20 py-3.5 px-5 flex items-center gap-2.5">
                <span className="w-1.5 h-4 bg-[#c40000] rounded-full shrink-0" />
                <span className="font-black text-gray-950 dark:text-gray-200 text-xs uppercase tracking-widest">Avbrutet prov</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3.5">
                  <OptionButton 
                    active={!state.result.testAborted} 
                    onClick={() => updateResult('testAborted', false)}
                  >
                    Nej
                  </OptionButton>
                  <OptionButton 
                    active={state.result.testAborted} 
                    onClick={() => updateResult('testAborted', true)}
                    variant="danger"
                  >
                    Ja (Avbrutet)
                  </OptionButton>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right summary pane */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
          
          <div className="bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-900/40 dark:to-slate-950/40 border border-gray-200 dark:border-white/10 rounded-2xl p-5 relative overflow-hidden text-gray-800 dark:text-gray-200 shadow-sm">
            {/* Background design elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 relative">
              <div className="border-b border-gray-100 dark:border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-[#7b7b7b] uppercase block">Aktuellt prov</span>
                  <h2 className="text-base font-black mt-0.5 text-gray-900 dark:text-white tracking-tight uppercase">sammanfattning</h2>
                </div>
                <div className="text-[9px] font-black tracking-widest text-[#c40000] bg-red-500/5 dark:bg-red-950/20 px-2.5 py-1 border border-[#c40000]/10 rounded-md">
                  DIREKTSTATUS
                </div>
              </div>

              {/* Candidate Info */}
              <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-4 border border-gray-150 dark:border-white/5 rounded-xl">
                <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/5 font-sans font-black text-gray-700 dark:text-white text-base">
                  {(state.properties.studentName || 'K')[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Kandidat</span>
                  <span className="font-exbold text-gray-900 dark:text-white text-sm truncate block leading-tight">{state.properties.studentName || 'Saknas'}</span>
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5 block leading-none">{state.properties.personalNumber || 'Saknas'}</span>
                </div>
              </div>

              {/* Score indicators */}
              <div className="space-y-3">
                
                {/* Score block 1 */}
                <div className="bg-white dark:bg-slate-950 p-4 border border-gray-150 dark:border-white/5 rounded-xl flex items-center justify-between transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#7b7b7b] uppercase tracking-wider font-bold">PROVMOMENT</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Körning på väg - Körning</span>
                  </div>
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md border ${
                    state.result.drivingResult === 'Godkänt' 
                      ? 'bg-[#e6f4ea] border-[#1e8e3e]/20 text-[#1e8e3e]' 
                      : state.result.drivingResult === 'Underkänt' 
                        ? 'bg-[#fce8e6] border-[#c62828]/20 text-[#c62828]' 
                        : 'bg-white border-[#d8d8d8] text-[#7b7b7b] dark:bg-white/5 dark:border-white/5'
                  }`}>
                    {state.result.drivingResult || 'VÄNTAR'}
                  </span>
                </div>

                {/* Score block 2 - always shown if mandatory */}
                {(HEAVY_LICENSES.includes(licenseType) || ['B', 'B96', 'BE'].includes(licenseType)) && (
                  <div className="bg-white dark:bg-slate-950 p-4 border border-gray-150 dark:border-white/5 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#7b7b7b] uppercase tracking-wider font-bold">PROVMOMENT</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Säkerhetskontroll</span>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md border ${
                      state.result.safetyCheckResult === 'Godkänt' 
                        ? 'bg-[#e6f4ea] border-[#1e8e3e]/20 text-[#1e8e3e]' 
                        : state.result.safetyCheckResult === 'Underkänt' 
                          ? 'bg-[#fce8e6] border-[#c62828]/20 text-[#c62828]' 
                          : 'bg-white border-[#d8d8d8] text-[#7b7b7b] dark:bg-white/5 dark:border-white/5'
                    }`}>
                      {state.result.safetyCheckResult || 'Ej ifyllt'}
                    </span>
                  </div>
                )}

              </div>

              {/* Tunga Behörigheter - Warning automatic feedback message */}
              {HEAVY_LICENSES.includes(licenseType) && state.result.safetyCheckResult === 'Godkänt' && state.result.drivingResult === 'Underkänt' && (
                <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-xl text-xs space-y-1.5 text-emerald-800 dark:text-emerald-200">
                  <div className="text-[9px] uppercase font-bold tracking-widest text-[#1e8e3e] flex items-center gap-1">
                    <span>✓</span>
                    Säkerhetskontroll godkänd
                  </div>
                  <div className="leading-snug text-gray-600 dark:text-gray-300">
                    Säkerhetskontrollen sparas som <strong>GODKÄND</strong> för framtida prov, men provets totalresultat blir <strong>UNDERKÄNT</strong> på grund av den underkända körningen.
                  </div>
                </div>
              )}

              {/* Heavy Warnings if active */}
              {(state.result.interventionOccurred || state.result.testAborted) && (
                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-xs space-y-1.5 font-bold text-red-900 dark:text-red-200">
                  <div className="text-[9px] uppercase font-black tracking-widest text-[#c40000] flex items-center gap-1.5">
                    <span className="shrink-0">⚠️</span>
                    Betydande avvikelser
                  </div>
                  {state.result.interventionOccurred && <div className="leading-tight text-[#7b7b7b] dark:text-gray-300 font-medium">• Ingripande har rapporterats</div>}
                  {state.result.testAborted && <div className="leading-tight text-[#7b7b7b] dark:text-gray-300 font-medium">• Provet avbröts i förtid</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Trigger creation */}
      <div className="flex justify-end pt-8 border-t border-gray-200 dark:border-white/10 sm:mt-8">
        <Button 
          onClick={handleNext} 
          size="lg" 
          className="rounded-xl px-12 shadow-sm border border-[#c40000] bg-[#c45000] hover:bg-[#c40000] text-white h-13 font-bold text-sm tracking-wide cursor-pointer transition-colors"
        >
          Generera protokoll
        </Button>
      </div>
    </div>
  );
}
