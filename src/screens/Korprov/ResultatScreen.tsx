import { useNavigate } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/ProvContext';
import { FailureForm } from './components/FailureForm';
import { generateProtocolPdf } from '../../lib/generateProtocolPdf';
import { FileDown, ArrowRight } from 'lucide-react';

export function ResultatScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();

  const licenseType = state.properties.licenseType || 'B';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  const SAFETY_CHECK_LICENSES = [...HEAVY_LICENSES, 'BE'];
  const isTaxi = licenseType === 'TAXI';

  const handleNext = () => {
    navigate('/korprov/protokoll');
  };

  const updateResult = (field: keyof typeof state.result, value: any) => {
    updateState((prev) => {
      const newState = { ...prev };
      newState.result = { ...newState.result, [field]: value };
      
      // If switching away from Underkänt, reset the corresponding failure form
      if (field === 'drivingResult' && value !== 'Underkänt') {
        newState.result.drivingFailure = {
          primaryCause: { area: '', deficiencies: [] },
          consequences: [],
          situations: [],
          interventionOccurred: false,
          testAborted: false,
        };
      }

      if (field === 'safetyCheckResult') {
        if (value === 'Underkänt') {
          if (!newState.result.safetyCheckFailure?.primaryCause?.area) {
            newState.result.safetyCheckFailure = {
              primaryCause: { area: 'Fordonskännedom', deficiencies: [] },
              consequences: [],
              situations: [],
              interventionOccurred: false,
              testAborted: false,
            };
          }
        } else {
          newState.result.safetyCheckFailure = {
            primaryCause: { area: '', deficiencies: [] },
            consequences: [],
            situations: [],
            interventionOccurred: false,
            testAborted: false,
          };
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
    let colors = 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm';
    if (active) {
      if (variant === 'danger') {
        colors = 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800/60 font-bold shadow-sm ring-1 ring-red-300 dark:ring-red-800/60';
      } else if (variant === 'success') {
        colors = 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 font-bold shadow-sm ring-1 ring-emerald-300 dark:ring-emerald-800/60';
      } else {
        colors = 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800/60 font-bold shadow-sm ring-1 ring-blue-300 dark:ring-blue-800/60';
      }
    }
    
    return (
      <button
        onClick={onClick}
        type="button"
        className={`px-4 py-3.5 border text-sm w-full min-h-[44px] flex items-center justify-between transition-all duration-200 rounded-xl cursor-pointer select-none active:scale-[0.98] ${colors}`}
      >
        <div className="flex items-center gap-3">
          {variant === 'success' && (
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-xs transition-colors duration-200 ${active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
              ✓
            </div>
          )}
          {variant === 'danger' && (
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-xs transition-colors duration-200 ${active ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
              ✗
            </div>
          )}
          {variant === 'default' && (
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-200 ${active ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
              {active && <div className="w-2 h-2 rounded-full bg-white shrink-0" />}
            </div>
          )}
          <span className="tracking-tight font-semibold text-[14px]">{children}</span>
        </div>
        {badge && (
          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md transition-colors ${active ? 'bg-current/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const isOmprovSakerhet = state.properties.testType === 'Omprov säkerhetskontroll';
  const isOmprovKorning = state.properties.testType === 'Omprov körning';
  const heavyMandatory = SAFETY_CHECK_LICENSES.includes(licenseType) && !isOmprovKorning;

  const drivingDone = isOmprovSakerhet || (Boolean(state.result.drivingResult) && state.result.drivingResult !== '-');
  const safetyDone = !heavyMandatory || (Boolean(state.result.safetyCheckResult) && state.result.safetyCheckResult !== '-');
  const isAssessmentComplete = drivingDone && safetyDone;

  let hasFailed = false;
  if (isOmprovSakerhet) {
    hasFailed = state.result.safetyCheckResult === 'Underkänt' || Boolean(state.result.testAborted);
  } else if (isOmprovKorning) {
    hasFailed = state.result.drivingResult === 'Underkänt' || Boolean(state.result.testAborted);
  } else {
    const safetyFailed = heavyMandatory && state.result.safetyCheckResult === 'Underkänt';
    hasFailed = state.result.drivingResult === 'Underkänt' || safetyFailed || Boolean(state.result.testAborted);
  }

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 px-4 sm:px-6 pb-24">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#1a73e8] dark:text-blue-400 mb-2 block">Bedömning</span>
          <h2 className="text-2xl sm:text-4xl font-sans font-black tracking-tight text-gray-900 dark:text-white uppercase">Beslutsunderlag</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base mt-2 max-w-2xl">
            Fastställ provets slutgiltiga resultat utifrån den systematiska helhetsbedömningen av förarprovet.
          </p>
        </div>
      </div>

      {/* Riktlinjer för bedömning (TSFS 2012:41) */}
      <div className="max-w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 p-4 sm:p-5 rounded-2xl text-slate-800 dark:text-slate-300 space-y-3 mb-8 print:hidden shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Bedömning av körprov (TSFS 2012:41 4 kap.)
        </h3>
        <ul className="text-sm space-y-1.5 list-disc pl-5 font-medium">
          <li>Momenten bedöms utifrån fyra kompetensområden: <strong className="text-slate-950 dark:text-white">fordonskännedom/manövrering</strong>, <strong className="text-slate-950 dark:text-white">miljö/sparsam körning</strong>, <strong className="text-slate-950 dark:text-white">trafikregler</strong>, och <strong className="text-slate-950 dark:text-white">trafiksäkerhet/beteende</strong>.</li>
          <li>Enstaka brister som vid en helhetsbedömning är av liten betydelse för trafiksäkerheten <strong className="text-slate-950 dark:text-white">ska inte leda till underkännande</strong>.</li>
          <li>Vid prov i nedsatt sikt/mörker eller riskfyllda förhållanden ges särskild vikt åt ljusbehandling, placering och hastighetsanpassning.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mt-6">
        {/* Left main pane */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Driving Status */}
          {!state.properties.testType?.includes('Omprov säkerhetskontroll') && (
          <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50 via-white to-white dark:from-slate-900/40 dark:to-slate-950/20 py-3.5 px-5 flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-[#c40000] rounded-full shrink-0" />
              <h3 className="text-xs font-black text-gray-950 dark:text-gray-200 uppercase tracking-widest">Körning</h3>
            </div>
            <div className="p-6">
              {state.properties.testType?.includes('Testprov') ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bedömningen görs efter en skala 1-6. Minst 5 krävs för att bli godkänd i körningen.
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((score) => {
                      const isPassing = score >= 5;
                      const isActive = state.result.drivingScore === score;
                      const activeClass = isActive 
                        ? (isPassing ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-600 text-white border-red-600')
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800';
                      return (
                        <button
                          key={score}
                          onClick={() => {
                            updateResult('drivingScore', score);
                            updateResult('drivingResult', isPassing ? 'Godkänt' : 'Underkänt');
                          }}
                          className={`h-12 flex items-center justify-center font-bold rounded-lg border transition-colors ${activeClass}`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    <OptionButton 
                      active={state.result.drivingResult === '-'} 
                      onClick={() => {
                        updateResult('drivingScore', null);
                        updateResult('drivingResult', '-');
                      }}
                    >
                      Ej genomförd
                    </OptionButton>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  <div className="col-span-2 md:col-span-1">
                    <OptionButton 
                      active={state.result.drivingResult === '-'} 
                      onClick={() => updateResult('drivingResult', '-')}
                    >
                      Ej genomförd
                    </OptionButton>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* If Failed on Driving */}
          {!state.properties.testType?.includes('Omprov säkerhetskontroll') && state.result.drivingResult === 'Underkänt' && (
            <div className="animate-fade-in mb-6">
              <FailureForm 
                title="Bristförteckning – Körning"
                data={state.result.drivingFailure}
                onChange={(data) => updateResult('drivingFailure', data)}
                type="driving"
              />
            </div>
          )}

          {/* Safety check result (Heavy licenses only — for non-heavy licenses this is set already during Körning) */}
          {!state.properties.testType?.includes('Omprov körning') && SAFETY_CHECK_LICENSES.includes(licenseType) && (
            <>
              <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden mb-6">
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
                      Godkänd
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
                <div className="animate-fade-in mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Intervention Card */}
            <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50 via-white to-white dark:from-slate-900/40 dark:to-slate-950/20 py-3.5 px-5 flex items-center gap-2.5">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full shrink-0" />
                <span className="font-black text-gray-950 dark:text-gray-200 text-xs uppercase tracking-widest">Ingripande har förekommit</span>
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
                    Ja
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
                    Ja
                  </OptionButton>
                </div>
              </div>
            </div>

          </div>

          {/* Detailed summary of deficiencies & interventions directly at the bottom of the left column */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 py-4 px-5">
              <h3 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2.5">
                Beslutssummering
              </h3>
            </div>
            
            <div className="p-5 space-y-6">
              
              {/* Row 1: Brister i kompetensområden */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Resultat:
                </h4>
                
                {!isAssessmentComplete ? (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3 shadow-sm font-medium">
                    <span>Väntar på bedömning. Markera provresultat ovan.</span>
                  </div>
                ) : !hasFailed ? (
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm">Provet är godkänt.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Status badges */}
                    <div className="space-y-2">
                      {!isOmprovSakerhet && state.result.drivingResult === 'Godkänt' && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3 rounded-xl flex items-center gap-2 font-bold text-sm">
                          <span>✓</span> Din körning är godkänd.
                        </div>
                      )}
                      {!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' && (
                        <div className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3 rounded-xl flex items-center gap-2 font-bold text-sm">
                          <span>✗</span> Din körning är underkänd.
                        </div>
                      )}
                      {SAFETY_CHECK_LICENSES.includes(licenseType) && !isOmprovKorning && state.result.drivingResult !== 'Underkänt' && state.result.safetyCheckResult === 'Underkänt' && (
                        <div className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3 rounded-xl flex items-center gap-2 font-bold text-sm">
                          <span>✗</span> Din säkerhetskontroll är underkänd.
                        </div>
                      )}
                      {isOmprovSakerhet && state.result.safetyCheckResult === 'Godkänt' && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3 rounded-xl flex items-center gap-2 font-bold text-sm">
                          <span>✓</span> Din säkerhetskontroll är godkänd.
                        </div>
                      )}
                      {isOmprovKorning && state.result.drivingResult === 'Godkänt' && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3 rounded-xl flex items-center gap-2 font-bold text-sm">
                          <span>✓</span> Din körning är godkänd.
                        </div>
                      )}
                    </div>

                    {/* Driving deficiencies */}
                    {state.result.drivingResult === 'Underkänt' && (
                      <div className="space-y-3">
                        <div className="border-[3px] border-[#C0504D] bg-red-50/20 dark:bg-red-950/10 p-4 rounded-lg space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#C0504D] text-white">
                              Grundorsak – Körning
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {state.result.drivingFailure?.primaryCause?.area || 'Inget område valt'}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            Din körning visar brister i att:
                          </div>

                          {state.result.drivingFailure?.primaryCause?.deficiencies?.length > 0 ? (
                            <ul className="text-xs text-gray-800 dark:text-gray-200 space-y-1 pl-5 list-disc font-medium">
                              {state.result.drivingFailure.primaryCause.deficiencies.map((d: string) => (
                                <li key={d}>{d}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-400 italic font-medium">Inga specifika brister markerade för detta område än.</p>
                          )}
                        </div>

                        {/* Consequence areas for driving */}
                        {state.result.drivingFailure?.consequences?.some((c: { area: string }) => c.area) && (
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#F79646] block">
                              Detta får konsekvenser på:
                            </span>
                            {state.result.drivingFailure.consequences.filter((c: { area: string }) => c.area).map((c: { area: string, id: string, deficiencies?: string[] }, ki: number) => (
                              <div key={c.id || ki} className="border-[3px] border-[#F79646] bg-orange-50/20 dark:bg-orange-950/10 p-3.5 rounded-lg space-y-1.5 shadow-sm">
                                <div className="text-xs font-bold text-gray-900 dark:text-white">{c.area}</div>
                                <div className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Din körning visar brister i att:</div>
                                {c.deficiencies && c.deficiencies.length > 0 && (
                                  <ul className="text-xs text-gray-800 dark:text-gray-200 font-medium pl-5 list-disc space-y-0.5">
                                    {c.deficiencies.map(d => <li key={d}>{d}</li>)}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Situations */}
                        {state.result.drivingFailure?.situations && state.result.drivingFailure.situations.length > 0 && (
                          <div className="pt-2 text-xs text-gray-700 dark:text-gray-300">
                            <span className="font-bold block mb-1">Brister har visat sig i följande situationer:</span>
                            <ul className="pl-5 list-disc space-y-0.5 text-xs text-gray-800 dark:text-gray-200">
                              {state.result.drivingFailure.situations.map((sit: string) => (
                                <li key={sit}>{sit}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Safety check deficiencies */}
                    {state.result.safetyCheckResult === 'Underkänt' && (
                      <div className="space-y-3">
                        <div className="border-[3px] border-[#C0504D] bg-red-50/20 dark:bg-red-950/10 p-4 rounded-lg space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#C0504D] text-white">
                              Grundorsak – Säkerhetskontroll
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {state.result.safetyCheckFailure?.primaryCause?.area || 'Fordonskännedom'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            Din säkerhetskontroll visar brister i att:
                          </div>
                          {state.result.safetyCheckFailure?.primaryCause?.deficiencies?.length > 0 ? (
                            <ul className="text-xs text-gray-800 dark:text-gray-200 space-y-1 pl-5 list-disc font-medium">
                              {state.result.safetyCheckFailure.primaryCause.deficiencies.map((d: string) => (
                                <li key={d}>{d}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-400 italic font-medium">Inga specifika brister markerade för detta område än.</p>
                          )}
                        </div>

                        {/* Consequence areas for safety check */}
                        {state.result.safetyCheckFailure?.consequences?.some((c: { area: string }) => c.area) && (
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#F79646] block">
                              Detta får konsekvenser på:
                            </span>
                            {state.result.safetyCheckFailure.consequences.filter((c: { area: string }) => c.area).map((c: { area: string, id: string, deficiencies?: string[] }, ki: number) => (
                              <div key={c.id || ki} className="border-[3px] border-[#F79646] bg-orange-50/20 dark:bg-orange-950/10 p-3.5 rounded-lg space-y-1.5 shadow-sm">
                                <div className="text-xs font-bold text-gray-900 dark:text-white">{c.area}</div>
                                <div className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Din säkerhetskontroll visar brister i att:</div>
                                {c.deficiencies && c.deficiencies.length > 0 && (
                                  <ul className="text-xs text-gray-800 dark:text-gray-200 font-medium pl-5 list-disc space-y-0.5">
                                    {c.deficiencies.map(d => <li key={d}>{d}</li>)}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Situations for safety check */}
                        {state.result.safetyCheckFailure?.situations && state.result.safetyCheckFailure.situations.length > 0 && (
                          <div className="pt-2 text-xs text-gray-700 dark:text-gray-300">
                            <span className="font-bold block mb-1">Brister har visat sig i följande situationer:</span>
                            <ul className="pl-5 list-disc space-y-0.5 text-xs text-gray-800 dark:text-gray-200">
                              {state.result.safetyCheckFailure.situations.map((sit: string) => (
                                <li key={sit}>{sit}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Row 2: Ingripande */}
              <div className="pt-5 border-t border-slate-100 dark:border-white/5 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Ingripande har förekommit:
                </h4>
                
                {state.result.interventionOccurred ? (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 p-3 rounded-xl shadow-sm text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <span>Ja</span> — Ingripande har förekommit.
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm flex items-center gap-2">
                    <span className="text-slate-400">✓</span> Nej — Inget ingripande har förekommit.
                  </div>
                )}
              </div>

              {/* Row 3: Avbrutet */}
              {state.result.testAborted && (
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2 animate-fade-in">
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-300 p-3 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
                    <span>Ja</span> — Provet har avbrutits i förtid.
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right summary pane - Moderniserat DigitaltProtokoll Beslutsunderlag */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-4 mt-2 lg:mt-0">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/40 transition-all duration-300 backdrop-blur-sm">
            {/* Header: ProvProtokoll Brand Bar */}
            <div className="bg-gradient-to-r from-[#002f6c] via-[#003882] to-[#002352] px-5 py-4 text-white flex items-center justify-between border-b border-blue-900/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-sm text-blue-200 border border-white/15 shadow-inner">
                  <span className="text-white">✓</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-200/80 block leading-none">DIGITALT PROTOKOLL</span>
                  <h2 className="text-sm font-black tracking-tight uppercase leading-tight mt-1 text-white flex items-center gap-1.5">
                    Beslutsunderlag
                  </h2>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-white border border-white/20 shadow-xs">
                {state.properties.testType?.includes('Bedömningsprov') ? 'Bedömning' : 'Körprov'}
              </span>
            </div>
            
            <div className="p-5 sm:p-6 space-y-5 bg-white dark:bg-slate-900">
              {/* Candidate Quick Profile Tile */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-slate-50 to-slate-100/70 dark:from-slate-950/80 dark:to-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">KANDIDAT</span>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base leading-snug mt-0.5 truncate">
                      {state.properties.studentName || 'Namn saknas'}
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{state.properties.personalNumber || 'Personnummer saknas'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-blue-600 dark:text-white tracking-wider shadow-xs">
                      {state.properties.testType?.includes('Bedömningsprov') || state.properties.testType?.includes('Testprov')
                        ? `Bedömningsprov (${licenseType})`
                        : licenseType || 'B'}
                    </span>
                    {state.properties.transmission === 'Automat' && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs">
                        Automat (78)
                      </span>
                    )}
                    {state.properties.tachograph === 'Utan färdskrivare' && (
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-300 border border-red-300 dark:border-red-800">
                        Utan färdskrivare
                      </span>
                    )}
                  </div>
                </div>
                {state.properties.registrationNumber && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                    <span className="text-[9px] uppercase font-sans font-bold text-slate-400">Fordon Reg.nr:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{state.properties.registrationNumber}</span>
                  </div>
                )}
              </div>

              {/* Provmoment Assessment Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Delbedömningar
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Kvalificering</span>
                </div>

                {/* Driving outcome */}
                <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Körning</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Trafiksäker körning</div>
                  </div>
                  <span className={`text-xs font-black uppercase px-3 py-1 rounded-lg border transition-all ${
                    state.result.drivingResult === 'Godkänt' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300 shadow-xs' 
                      : state.result.drivingResult === 'Underkänt' 
                        ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-950/50 dark:border-red-700 dark:text-red-300 shadow-xs' 
                        : 'bg-slate-100 border-slate-250 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                  }`}>
                    {state.result.drivingResult || 'Väntar'}
                  </span>
                </div>

                {/* Safety check outcome */}
                {SAFETY_CHECK_LICENSES.includes(licenseType) && (
                  <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fordonskontroll</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Säkerhetskontroll</div>
                    </div>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-lg border transition-all ${
                      state.result.safetyCheckResult === 'Godkänt' 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300 shadow-xs' 
                        : state.result.safetyCheckResult === 'Underkänt' 
                          ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-950/50 dark:border-red-700 dark:text-red-300 shadow-xs' 
                          : 'bg-slate-100 border-slate-250 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                    }`}>
                      {state.result.safetyCheckResult || 'Ej ifyllt'}
                    </span>
                  </div>
                )}
              </div>

              {/* Tunga Behörigheter & BE - Informative notice */}
              {(HEAVY_LICENSES.includes(licenseType) || licenseType === 'BE') && state.result.safetyCheckResult === 'Godkänt' && state.result.drivingResult === 'Underkänt' && (
                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3.5 text-xs text-emerald-900 dark:text-emerald-300 shadow-xs">
                  <div className="font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1 text-emerald-800 dark:text-emerald-400">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">✓</span> Säkerhetskontroll godkänd
                  </div>
                  <div className="text-[11.5px] leading-relaxed">
                    Säkerhetskontrollen tillgodoräknas som <strong>GODKÄND</strong> för framtida provtillfällen enligt gällande föreskrifter.
                  </div>
                </div>
              )}

              {/* Tunga Behörigheter & BE - Säkerhetskontroll underkänd, körning godkänd */}
              {(HEAVY_LICENSES.includes(licenseType) || licenseType === 'BE') && state.result.safetyCheckResult === 'Underkänt' && state.result.drivingResult === 'Godkänt' && (
                <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5 text-xs text-blue-950 dark:text-blue-200 shadow-xs">
                  <div className="font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1 text-blue-800 dark:text-blue-400">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">✓</span> Din körning är godkänd
                  </div>
                  <div className="text-[11.5px] leading-relaxed">
                    Körningen tillgodoräknas som <strong>GODKÄND</strong> för framtida provtillfällen. Endast säkerhetskontroll behöver genomföras vid omprov enligt gällande föreskrifter.
                  </div>
                </div>
              )}

              {/* Deviations / Interventions */}
              {(state.result.interventionOccurred || state.result.testAborted) && (
                <div className="bg-red-50/90 dark:bg-red-950/40 border-l-4 border-l-[#c40000] border border-red-200 dark:border-red-800 rounded-xl p-3.5 text-xs text-red-900 dark:text-red-300 shadow-xs">
                  <div className="font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1 text-red-800 dark:text-red-400">
                    <span>⚠️</span> Notering från provet
                  </div>
                  <ul className="text-[11.5px] space-y-1 pl-1 font-semibold">
                    {state.result.interventionOccurred && <li>• Ingripande har rapporterats under körning</li>}
                    {state.result.testAborted && <li>• Provet har avbrutits i förtid</li>}
                  </ul>
                </div>
              )}

              {/* TOTALRESULTAT - Hero Decision Card */}
              <div className="pt-2">
                {(() => {
                  const isOmprovSakerhet = state.properties.testType === 'Omprov säkerhetskontroll';
                  const isOmprovKorning = state.properties.testType === 'Omprov körning';
                  const heavyMandatory = SAFETY_CHECK_LICENSES.includes(licenseType) && !isOmprovKorning;

                  const drivingDone = isOmprovSakerhet || (Boolean(state.result.drivingResult) && state.result.drivingResult !== '-');
                  const safetyDone = !heavyMandatory || (Boolean(state.result.safetyCheckResult) && state.result.safetyCheckResult !== '-');

                  let anyFail = false;
                  if (isOmprovSakerhet) {
                    anyFail = state.result.safetyCheckResult === 'Underkänt' || Boolean(state.result.testAborted);
                  } else if (isOmprovKorning) {
                    anyFail = state.result.drivingResult === 'Underkänt' || Boolean(state.result.testAborted);
                  } else {
                    const safetyFailed = heavyMandatory && state.result.safetyCheckResult === 'Underkänt';
                    anyFail = state.result.drivingResult === 'Underkänt' || safetyFailed || Boolean(state.result.testAborted);
                  }

                  const complete = drivingDone && safetyDone;

                  let label = 'Väntar på bedömning';
                  let statusDesc = 'Fyll i resultat ovan för att fastställa beslut';
                  let tone = 'slate';

                  const isAssessmentOnly = state.properties.testType?.includes('Bedömningsprov') || state.properties.testType?.includes('Testprov');

                  if (complete) {
                    if (anyFail) { 
                      label = 'UNDERKÄNT'; 
                      statusDesc = isTaxi
                        ? 'Kandidaten uppfyller ej kraven enligt taxitrafiklagen (2012:211)'
                        : 'Kandidaten uppfyller ej kraven för godkänd bedömning';
                      tone = 'red'; 
                    } else { 
                      label = 'GODKÄNT'; 
                      statusDesc = (isAssessmentOnly || isTaxi)
                        ? 'Godkänd körning – Ingen behörighet uppnådd' 
                        : 'Kandidaten uppfyller samtliga krav för behörigheten';
                      tone = 'emerald'; 
                    }
                  }

                  return (
                    <div className={`rounded-2xl border-2 p-5 transition-all duration-300 shadow-md ${
                      tone === 'emerald'
                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-white dark:from-emerald-950/60 dark:to-slate-900 text-emerald-950 dark:text-white ring-2 ring-emerald-500/20'
                        : tone === 'red'
                          ? 'border-red-500 bg-gradient-to-br from-red-50 via-red-50/70 to-white dark:from-red-950/60 dark:to-slate-900 text-red-950 dark:text-white ring-2 ring-red-500/20'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                            PROVETS TOTALRESULTAT
                          </span>
                          <span className={`text-2xl font-black uppercase tracking-tight block mt-1 ${
                            tone === 'emerald' ? 'text-emerald-700 dark:text-emerald-300' :
                            tone === 'red' ? 'text-red-700 dark:text-red-400' :
                            'text-slate-700 dark:text-slate-300'
                          }`}>
                            {label}
                          </span>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl font-black text-white shadow-md transition-transform duration-200 ${
                          tone === 'emerald' ? 'bg-emerald-600 shadow-emerald-600/30' :
                          tone === 'red' ? 'bg-[#c40000] shadow-red-600/30' :
                          'bg-slate-400 dark:bg-slate-600'
                        }`}>
                          {tone === 'emerald' ? '✓' : tone === 'red' ? '✗' : '—'}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 leading-relaxed">
                        {statusDesc}
                      </div>
                      {(isAssessmentOnly || isTaxi) && complete && !anyFail && (
                        <div className="mt-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-2xs">
                          <span>Ingen behörighet uppnådd</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer / Trigger creation & Direct PDF Download */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-8 border-t border-slate-200 dark:border-slate-800 sm:mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => generateProtocolPdf(state)}
          size="lg"
          className="rounded-xl px-6 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 h-14 font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <FileDown className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>Ladda ner PDF (Protokoll)</span>
        </Button>

        <Button
          onClick={handleNext}
          size="lg"
          className="rounded-xl px-12 shadow-lg shadow-blue-500/20 border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white h-14 font-bold text-[15px] tracking-wide cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Generera protokoll</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
