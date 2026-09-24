import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Save, 
  User, 
  Car, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { AppState } from '../../../types';
import { triggerHaptic } from '../../../lib/utils';
import { useToast } from '../../../components/Toast';

interface TrafiklararProtokollViewProps {
  state: AppState;
  inspectorName?: string;
}

export function TrafiklararProtokollView({ state, inspectorName }: TrafiklararProtokollViewProps) {
  const { showToast } = useToast();

  const licenseType = state.properties.licenseType || 'B';
  const studentName = state.properties.studentName || 'Elev/Kandidat';
  const personalNumber = state.properties.personalNumber || '';
  const testDate = state.properties.testDate || new Date().toISOString().split('T')[0];
  const teacher = inspectorName || state.properties.examiner || 'Trafiklärare';

  const isPassed = state.result.drivingResult === 'Godkänt' && !state.result.testAborted;
  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;

  // Lärar-specifika fält (sparas lokalt i sessionen)
  const [recommendedLessons, setRecommendedLessons] = useState<string>('2');
  const [focusAreas, setFocusAreas] = useState<string>(() => {
    if (drivingFail?.primaryCause?.area) {
      return `${drivingFail.primaryCause.area} (${drivingFail.primaryCause.deficiencies.join(', ')})`;
    }
    return 'Cirkulationsplatser, backning runt hörn och självständig körning mot mål.';
  });
  const [teacherNotes, setTeacherNotes] = useState<string>(state.testNotes || '');
  const [privatePracticeAdvice, setPrivatePracticeAdvice] = useState<string>(
    'Träna med handledare på att titta långt fram och hålla blicken rörlig i korsningar och cirkulationsplatser.'
  );

  const handlePrint = () => {
    triggerHaptic('light');
    window.print();
  };

  const handleSaveNotes = () => {
    triggerHaptic('medium');
    showToast('Trafiklärarprotokollet har sparats i elevakten!', 'success');
  };

  // Kompetensområden för STR & Trafikskolans kursplan
  const competenceAreas = [
    {
      title: '1. Fordonskännedom & Manövrering',
      desc: 'Start i motlut, krypkörning, backning, växling, styrning och säkerhetskontroll.',
      status: state.result.safetyCheckResult === 'Underkänt' || drivingFail?.primaryCause?.area === 'Fordonskännedom' ? 'Brist' : 'Godkänd',
      feedback: state.result.safetyCheckResult === 'Underkänt' ? 'Säkerhetskontrollen underkändes.' : 'Godkänd hantering och manövrering.'
    },
    {
      title: '2. Miljö & Sparsam körning',
      desc: 'Ecodriving, motorbroms, framförhållning och anpassad acceleration.',
      status: drivingFail?.primaryCause?.area === 'Miljö och sparsam körning' ? 'Brist' : 'Godkänd',
      feedback: 'Bra planering av körningen med god retardationsplanering.'
    },
    {
      title: '3. Trafikregler & Tillämpning',
      desc: 'Väjningsplikt, högerregeln, cirkulationsplatser, hastighet och skyltavläsning.',
      status: drivingFail?.primaryCause?.area === 'Trafikregler' ? 'Brist' : 'Godkänd',
      feedback: drivingFail?.primaryCause?.area === 'Trafikregler' ? 'Regelavvikelser noterade.' : 'Följer anvisningar och trafikregler säkert.'
    },
    {
      title: '4. Trafiksäkerhet & Beteende',
      desc: 'Avsökning, uppsikt, döda vinkeln, samspel med cyklister/fotgängare och riskmedvetenhet.',
      status: state.result.interventionOccurred || drivingFail?.primaryCause?.area === 'Trafiksäkerhet och beteende' ? 'Brist' : 'Godkänd',
      feedback: state.result.interventionOccurred ? 'Ingripande skedde under provet.' : 'God observation och avsökningsrutin.'
    },
    {
      title: '5. Personliga förutsättningar & Självvärdering',
      desc: 'Självständig körning mot mål, stresshantering, koncentration och riskbedömning.',
      status: state.result.testAborted ? 'Brist' : 'Godkänd',
      feedback: 'Fungerar självständigt i blandad trafik.'
    }
  ];

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      
      {/* Lärar-specifik åtgärdslist */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-300 dark:border-emerald-800 rounded-2xl print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                Endast för Trafiklärare & Utbildare
              </span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                • Ej synligt för kandidaten
              </span>
            </div>
            <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
              Pedagogiskt Utbildningsprotokoll ({licenseType})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveNotes}
            className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Save size={14} />
            <span>Spara i elevakten</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>Skriv ut lärarprotokoll</span>
          </button>
        </div>
      </div>

      {/* Själva Lärarprotokollet (Dokumentmall för Trafikskola) */}
      <div 
        className="max-w-[730px] mx-auto bg-white w-full sm:rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 text-black relative"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        {/* Vattenstämpel / Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-4 mb-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              TRAFIKSKOLANS INTERNA UTBILDNINGSAKT • STR / FÖRARUTBILDNING
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 mt-1">
              Trafiklärarprotokoll & Utvärdering
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pedagogisk analys av genomfört körprov / utbildningskontroll
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider text-white ${
              isPassed ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
              {isPassed ? 'PROVSTATUS: GODKÄNT' : 'PROVSTATUS: UNDERKÄNT'}
            </span>
            <div className="text-[11px] font-mono text-gray-400 mt-1">
              Ref: LÄRARE-{Date.now().toString(36).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Elev- & provdata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Elev:</span>
            <strong className="text-gray-950 text-sm">{studentName}</strong>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Personnummer:</span>
            <strong className="font-mono text-gray-950">{personalNumber || 'Saknas'}</strong>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Behörighet / Bil:</span>
            <strong className="text-gray-950">{licenseType} ({state.properties.transmission})</strong>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Lärare / Inspektör:</span>
            <strong className="text-gray-950 truncate">{teacher}</strong>
          </div>
        </div>

        {/* De 5 Kompetensområdena (Utbildningsöversikt) */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 flex items-center justify-between">
            <span>Bedömning av de 5 kompetensområdena</span>
            <span className="text-[10px] text-gray-400 font-normal">Krav enligt Transportstyrelsens föreskrifter</span>
          </h3>

          <div className="space-y-2">
            {competenceAreas.map((area, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl border border-gray-200 flex items-start justify-between gap-3 text-xs bg-white"
              >
                <div className="space-y-0.5">
                  <div className="font-black text-gray-950">{area.title}</div>
                  <div className="text-[11px] text-gray-500 leading-tight">{area.desc}</div>
                  <div className="text-[11px] font-semibold text-gray-700 pt-0.5">
                    Kommentar: {area.feedback}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                  area.status === 'Godkänd'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {area.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bristanalys & Situationer (om provet hade anmärkningar) */}
        {(drivingFail?.primaryCause?.area || safetyFail?.primaryCause?.area) && (
          <div className="p-4 bg-red-50/80 rounded-xl border border-red-200 text-xs space-y-2 mb-6">
            <div className="font-black uppercase text-red-900 flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>Identifierade brister under körningen:</span>
            </div>

            {drivingFail?.primaryCause?.area && (
              <div className="pl-4 border-l-2 border-red-400 space-y-1">
                <div><strong>Huvudorsak:</strong> {drivingFail.primaryCause.area}</div>
                {drivingFail.primaryCause.deficiencies.length > 0 && (
                  <div><strong>Specifika brister:</strong> {drivingFail.primaryCause.deficiencies.join(', ')}</div>
                )}
                {drivingFail.situations.length > 0 && (
                  <div><strong>Situationer:</strong> {drivingFail.situations.join(', ')}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Provade moment (Sammanställning för läraren) */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-2">
            Genomförda provmoment ({state.includedTestItems?.length || 0} st)
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(state.includedTestItems || []).map((item, i) => (
              <span key={i} className="text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200">
                ✓ {item}
              </span>
            ))}
          </div>
        </div>

        {/* Trafiklärarens Handlingsplan & Vidare Utbildningsrekommendation */}
        <div className="p-4 bg-emerald-50/50 rounded-xl border-2 border-emerald-200/80 space-y-3 text-xs mb-6">
          <div className="font-black uppercase text-emerald-950 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Trafiklärarens pedagogiska handlingsplan:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Rekommenderade lektioner:
              </label>
              <select
                value={recommendedLessons}
                onChange={(e) => setRecommendedLessons(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-gray-300 rounded-lg text-xs font-bold"
              >
                <option value="0">0 st (Redo för prov)</option>
                <option value="1">1 lektion (Finlir)</option>
                <option value="2">2 lektioner</option>
                <option value="3-4">3–4 lektioner</option>
                <option value="5+">5+ lektioner (Mer grundträning)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Fokusområden för körträning:
              </label>
              <input
                type="text"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
              Råd till privat handledare (om tillämpligt):
            </label>
            <input
              type="text"
              value={privatePracticeAdvice}
              onChange={(e) => setPrivatePracticeAdvice(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
              Interna anteckningar i elevakten:
            </label>
            <textarea
              rows={2}
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Lärarens privata anteckningar..."
              className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs resize-none"
            />
          </div>
        </div>

        {/* Lärarsignatur */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div>
            <span>Underskrift utbildare: </span>
            <strong className="text-gray-900 border-b border-gray-400 pb-0.5 px-2 font-mono">
              {teacher}
            </strong>
          </div>
          <div>
            <span>Datum: </span>
            <strong className="text-gray-900 font-mono">{testDate}</strong>
          </div>
        </div>

      </div>

    </div>
  );
}
