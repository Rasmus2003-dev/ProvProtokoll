import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Check, 
  GraduationCap, 
  Car, 
  Clock, 
  Calendar, 
  User, 
  Sparkles,
  BookOpen,
  FileCheck
} from 'lucide-react';
import { 
  LektionsProtokoll, 
  OvadeMomentEntry, 
  TrafikskolaProfile, 
  saveLektionsProtokoll 
} from '../../lib/trafikskolaData';
import { StudentProfile } from '../../screens/TrafikskolaScreen';
import { useToast } from '../Toast';
import { triggerHaptic } from '../../lib/utils';

interface SkapaLektionsProtokollModalProps {
  students: StudentProfile[];
  selectedStudent?: StudentProfile;
  skola: TrafikskolaProfile;
  onClose: () => void;
  onSaved: (protokoll: LektionsProtokoll) => void;
}

const STR_MOMENT_CHOICES = [
  { momentNr: 1, title: 'Körställning & Reglage', category: 'Körställning' },
  { momentNr: 2, title: 'Koppling, Gas & Broms (Krypkörning)', category: 'Manövrering' },
  { momentNr: 3, title: 'Växling & Ecodriving', category: 'Manövrering' },
  { momentNr: 4, title: 'Manövrering: Backning & Parkering', category: 'Manövrering' },
  { momentNr: 5, title: 'Säkerhetskontroll (Inre & Yttre)', category: 'Körställning' },
  { momentNr: 6, title: 'Mindre bostadsområden & Högerregeln', category: 'Trafikmiljö' },
  { momentNr: 7, title: 'Trafikljus & Cirkulationsplatser', category: 'Trafikmiljö' },
  { momentNr: 8, title: 'Landsväg, Omkörning & Järnväg', category: 'Landsväg' },
  { momentNr: 9, title: 'Motorväg & Motortrafikled', category: 'Landsväg' },
  { momentNr: 10, title: 'Mörkerkörning & Halka', category: 'Landsväg' },
  { momentNr: 11, title: 'Självständig körning mot mål', category: 'Självständig körning' },
  { momentNr: 12, title: 'Utbildningskontroll / Provsimulering', category: 'Självständig körning' },
];

export function SkapaLektionsProtokollModal({
  students,
  selectedStudent,
  skola,
  onClose,
  onSaved
}: SkapaLektionsProtokollModalProps) {
  const { showToast } = useToast();

  const [studentId, setStudentId] = useState(selectedStudent?.id || students[0]?.id || '');
  const activeStudent = students.find(s => s.id === studentId) || selectedStudent || students[0];

  const [lektionNr, setLektionNr] = useState((activeStudent?.totalLessons || 0) + 1);
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);
  const [tid, setTid] = useState('13:00');
  const [langdMinuter, setLangdMinuter] = useState(50);
  const [selectedVehicle, setSelectedVehicle] = useState(
    skola.vehicles.find(v => v.licenseCategory === (activeStudent?.licenseType || 'B'))?.model ||
    `${skola.vehicles[0]?.model} (${skola.vehicles[0]?.regNr})`
  );
  const [larare, setLarare] = useState(skola.utbildningsledare);
  const [lektionstyp, setLektionstyp] = useState<LektionsProtokoll['lektionstyp']>('Stadstrafik & Samspel');

  // Selected moments
  const [ovadeMoment, setOvadeMoment] = useState<OvadeMomentEntry[]>([
    { momentNr: 6, momentTitel: 'Mindre bostadsområden & Högerregeln', category: 'Trafikmiljö', niva: 2, kommentar: 'God uppsikt men behöver hålla lägre fart vid skymda hörn.' },
    { momentNr: 7, momentTitel: 'Trafikljus & Cirkulationsplatser', category: 'Trafikmiljö', niva: 2, kommentar: 'Bra placering och planering.' }
  ]);

  const [styrkor, setStyrkor] = useState('Lugn körning, bra uppsikt framåt och mjuk pedaldosering.');
  const [utvecklingsomraden, setUtvecklingsomraden] = useState('Tidig teckengivning och bättre avsökning bakåt vid inbromsning.');
  const [radHandledare, setRadHandledare] = useState('Öva på cirkulationsplatser och spegel-döda vinkeln-rutiner i lugna områden.');
  const [betygHelhet, setBetygHelhet] = useState<LektionsProtokoll['betygHelhet']>('Godkänd lektion');
  const [nastaSteg, setNastaSteg] = useState('Lektion ' + (lektionNr + 1) + ': Fördjupning landsväg och hastighetsanpassning.');

  const toggleMoment = (choice: typeof STR_MOMENT_CHOICES[0]) => {
    triggerHaptic('light');
    const exists = ovadeMoment.find(m => m.momentNr === choice.momentNr);
    if (exists) {
      setOvadeMoment(prev => prev.filter(m => m.momentNr !== choice.momentNr));
    } else {
      setOvadeMoment(prev => [
        ...prev,
        {
          momentNr: choice.momentNr,
          momentTitel: choice.title,
          category: choice.category,
          niva: 2,
          kommentar: ''
        }
      ]);
    }
  };

  const updateMomentNiva = (momentNr: number, niva: 1 | 2 | 3) => {
    triggerHaptic('light');
    setOvadeMoment(prev => prev.map(m => m.momentNr === momentNr ? { ...m, niva } : m));
  };

  const updateMomentKommentar = (momentNr: number, kommentar: string) => {
    setOvadeMoment(prev => prev.map(m => m.momentNr === momentNr ? { ...m, kommentar } : m));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      showToast('Välj en elev för protokollet', 'error');
      return;
    }
    if (ovadeMoment.length === 0) {
      showToast('Välj minst ett övat moment under lektionen', 'error');
      return;
    }

    const newProtocol: LektionsProtokoll = {
      id: 'lek-' + Date.now(),
      lektionNr,
      elevId: activeStudent.id,
      elevNamn: activeStudent.name,
      personalNumber: activeStudent.personalNumber,
      datum,
      tid,
      langdMinuter,
      fordon: selectedVehicle,
      larare,
      lektionstyp,
      ovadeMoment,
      styrkor,
      utvecklingsomraden,
      radHandledare,
      betygHelhet,
      nastaLektionRekommendation: nastaSteg,
      createdAt: new Date().toISOString()
    };

    saveLektionsProtokoll(newProtocol);
    triggerHaptic('medium');
    showToast(`Körlektionsprotokoll #${lektionNr} har sparats för ${activeStudent.name}!`, 'success');
    onSaved(newProtocol);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl my-auto shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#002f6c] to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Skapa Körlektionsprotokoll
              </h2>
              <p className="text-xs text-blue-200">
                {skola.name} • Officiellt STR-Utbildningskort
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Elev & Lektionsinfo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Trafikelev
              </label>
              <select
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  const s = students.find(stud => stud.id === e.target.value);
                  if (s) setLektionNr(s.totalLessons + 1);
                }}
                className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.licenseType} - {s.personalNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Lektion Nummer
              </label>
              <input
                type="number"
                min={1}
                value={lektionNr}
                onChange={(e) => setLektionNr(parseInt(e.target.value) || 1)}
                className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Lektionstyp
              </label>
              <select
                value={lektionstyp}
                onChange={(e) => setLektionstyp(e.target.value as any)}
                className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="Grundövning">Grundövning (Manövrering)</option>
                <option value="Stadstrafik & Samspel">Stadstrafik & Samspel</option>
                <option value="Landsväg & Högre fart">Landsväg & Högre fart</option>
                <option value="Motorväg & Omkörning">Motorväg & Omkörning</option>
                <option value="Mörker & Halka">Mörker & Halka</option>
                <option value="Provsimulering">Provsimulering (Intern uppkörning)</option>
              </select>
            </div>
          </div>

          {/* Datum, Längd & Bil */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Datum
              </label>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Tid
              </label>
              <input
                type="time"
                value={tid}
                onChange={(e) => setTid(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Längd
              </label>
              <select
                value={langdMinuter}
                onChange={(e) => setLangdMinuter(parseInt(e.target.value))}
                className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value={40}>40 min</option>
                <option value={50}>50 min (Enkellektion)</option>
                <option value={80}>80 min (Utökad)</option>
                <option value={100}>100 min (Dubbellektion)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Skolbil
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                {skola.vehicles.map(v => (
                  <option key={v.id} value={`${v.model} (${v.regNr})`}>
                    {v.regNr} - {v.model} ({v.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Övade moment - Val & STR Betyg (1, 2, 3) */}
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[#002f6c] dark:text-blue-400" />
                  Moment som övades under lektionen
                </h3>
                <p className="text-[11px] text-gray-500">
                  Klicka på momenten för att lägga till och sätt STR-betygsnivå (1=Visat, 2=Övad, 3=Klar).
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {ovadeMoment.length} valda
              </span>
            </div>

            {/* Quick selector chips */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
              {STR_MOMENT_CHOICES.map(c => {
                const isSelected = ovadeMoment.some(m => m.momentNr === c.momentNr);
                return (
                  <button
                    key={c.momentNr}
                    type="button"
                    onClick={() => toggleMoment(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#002f6c] text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <span>{c.momentNr}. {c.title}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>

            {/* Selected moments evaluation card */}
            {ovadeMoment.length > 0 && (
              <div className="space-y-2 border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 p-3 rounded-xl">
                <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                  Betygssättning per moment:
                </div>
                <div className="space-y-2">
                  {ovadeMoment.map(m => (
                    <div key={m.momentNr} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {m.momentNr}. {m.momentTitel}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {/* 1, 2, 3 buttons */}
                        <div className="inline-flex rounded-lg border border-gray-200 dark:border-slate-700 p-0.5 bg-gray-50 dark:bg-slate-900">
                          <button
                            type="button"
                            onClick={() => updateMomentNiva(m.momentNr, 1)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                              m.niva === 1 ? 'bg-amber-500 text-white' : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            1: Visat
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMomentNiva(m.momentNr, 2)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                              m.niva === 2 ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            2: Övad
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMomentNiva(m.momentNr, 3)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                              m.niva === 3 ? 'bg-emerald-600 text-white' : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            3: Klar
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Kort kommentar..."
                          value={m.kommentar || ''}
                          onChange={(e) => updateMomentKommentar(m.momentNr, e.target.value)}
                          className="h-7 px-2 text-[11px] bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md w-44"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lärarens bedömning & handledarråd */}
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  ✓ Vad gick bra idag? (Styrkor)
                </label>
                <textarea
                  rows={2}
                  value={styrkor}
                  onChange={(e) => setStyrkor(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  ⚠ Utvecklingsområden
                </label>
                <textarea
                  rows={2}
                  value={utvecklingsomraden}
                  onChange={(e) => setUtvecklingsomraden(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs resize-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-blue-700 dark:text-blue-400 block mb-1">
                🎓 Råd & Träningsuppgift till privat handledare
              </label>
              <input
                type="text"
                value={radHandledare}
                onChange={(e) => setRadHandledare(e.target.value)}
                placeholder="T.ex. Öva på cirkulationsplatser och spegelrutiner i lugna områden..."
                className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Helhetsomdöme för lektionen
                </label>
                <select
                  value={betygHelhet}
                  onChange={(e) => setBetygHelhet(e.target.value as any)}
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="Utmärkt framsteg">★ Utmärkt framsteg</option>
                  <option value="Godkänd lektion">✓ Godkänd lektion</option>
                  <option value="Behöver mer repetition">⚠ Behöver mer repetition</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Nästa steg / Rekommendation
                </label>
                <input
                  type="text"
                  value={nastaSteg}
                  onChange={(e) => setNastaSteg(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#002f6c] hover:bg-[#00224f] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <FileCheck size={15} />
              <span>Spara & Generera Lektionskort</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
