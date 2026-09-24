import React from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  GraduationCap, 
  Car, 
  Clock, 
  Calendar, 
  User, 
  Award, 
  ShieldCheck, 
  FileText, 
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { LektionsProtokoll, TrafikskolaProfile } from '../../lib/trafikskolaData';

interface LektionsProtokollDocumentProps {
  protokoll: LektionsProtokoll;
  skola: TrafikskolaProfile;
  onClose?: () => void;
  onPrint?: () => void;
}

export function LektionsProtokollDocument({
  protokoll,
  skola,
  onClose,
  onPrint
}: LektionsProtokollDocumentProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const getNivaBadge = (niva: 1 | 2 | 3) => {
    switch (niva) {
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Nivå 1 • Visat / Instruktion
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            Nivå 2 • Övad med stöd
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            Nivå 3 • Självständig / Klar
          </span>
        );
    }
  };

  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl mx-auto my-4 print:my-0 print:border-none print:shadow-none print:max-w-none">
      
      {/* Top action bar (hidden when printing) */}
      <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <GraduationCap size={16} />
          </div>
          <span className="text-xs font-bold tracking-wide uppercase">
            Körlektionskort • Lektionsprotokoll
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Skriv ut / Spara PDF</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Stäng"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Document Content */}
      <div className="p-6 sm:p-8 space-y-6 text-slate-800">
        
        {/* School Header & Emblems */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#002f6c] text-white flex items-center justify-center font-black text-lg shadow-sm">
                S
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#002f6c] tracking-tight">
                  {skola.name}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                  {skola.slogan}
                </p>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-slate-600 space-y-0.5">
              <p>{skola.address}, {skola.city}</p>
              <p>Telefon: <span className="font-semibold text-slate-900">{skola.phone}</span> • E-post: <span className="text-blue-600">{skola.email}</span></p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs font-bold">
              <ShieldCheck size={14} className="text-blue-700" />
              <span>Auktoriserad STR-Medlem</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Org.nr: {skola.orgNumber}
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              STR-Regnr: {skola.strNumber}
            </div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">
              Pedagogiskt Utbildningskort & Lektionsbedömning
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Körlektion #{protokoll.lektionNr} — {protokoll.lektionstyp}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              protokoll.betygHelhet === 'Utmärkt framsteg'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : protokoll.betygHelhet === 'Godkänd lektion'
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              ★ {protokoll.betygHelhet}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <User size={12} /> Elev
            </div>
            <div className="font-bold text-slate-900 mt-0.5">{protokoll.elevNamn}</div>
            <div className="text-[10px] font-mono text-slate-500">{protokoll.personalNumber}</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <Calendar size={12} /> Datum & Tid
            </div>
            <div className="font-bold text-slate-900 mt-0.5">{protokoll.datum}</div>
            <div className="text-[10px] text-slate-500">kl. {protokoll.tid} ({protokoll.langdMinuter} min)</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <Car size={12} /> Utbildningsbil
            </div>
            <div className="font-bold text-slate-900 mt-0.5 truncate">{protokoll.fordon}</div>
            <div className="text-[10px] text-slate-500">Skolans vagnpark</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <GraduationCap size={12} /> Utbildare
            </div>
            <div className="font-bold text-slate-900 mt-0.5">{protokoll.larare}</div>
            <div className="text-[10px] text-slate-500">Leg. Trafiklärare</div>
          </div>
        </div>

        {/* Practiced moments table with STR 3-tier grading */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#002f6c]" />
              Övade Moment under lektionen (STR Kursplan)
            </h3>
            <span className="text-[10px] text-slate-500">
              Skala: 1 = Visat, 2 = Övad, 3 = Självständig
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
            {protokoll.ovadeMoment.map((entry) => (
              <div key={entry.momentNr} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#002f6c]/10 text-[#002f6c] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {entry.momentNr}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{entry.momentTitel}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        {entry.category}
                      </span>
                    </div>
                    {entry.kommentar && (
                      <p className="text-slate-600 text-xs mt-0.5">
                        "{entry.kommentar}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 self-end sm:self-center">
                  {getNivaBadge(entry.niva)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Feedback & Strengths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
            <div className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
              <CheckCircle2 size={13} /> Dagens Styrkor & Framsteg
            </div>
            <p className="text-slate-800 text-xs leading-relaxed">
              {protokoll.styrkor || 'Gott engagemang och god koncentration genom hela lektionen.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
            <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
              <AlertCircle size={13} /> Utvecklingsområden
            </div>
            <p className="text-slate-800 text-xs leading-relaxed">
              {protokoll.utvecklingsomraden || 'Fortsätt nöta på spegelrutiner och planering i förväg.'}
            </p>
          </div>
        </div>

        {/* Home practice advice for supervisor */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 text-xs">
          <div className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
            <Sparkles size={13} className="text-blue-700" /> Råd & Träningsuppgift till privat handledare
          </div>
          <p className="text-slate-800 text-xs leading-relaxed">
            {protokoll.radHandledare || 'Träna på att köra i blandad miljö med fokus på avsökning och mjuk inbromsning.'}
          </p>
        </div>

        {/* Next recommended step */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Nästa steg / Rekommendation:</span>
            <span className="font-bold text-slate-900">{protokoll.nastaLektionRekommendation}</span>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>Protokoll-ID: </span>
            <strong className="font-mono text-slate-800">{protokoll.id}</strong>
            <span className="mx-2">•</span>
            <span>Skapat: {new Date(protokoll.createdAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400">Underskrift utbildare</div>
              <div className="font-serif italic font-bold text-slate-900 border-b border-slate-400 px-3 pb-0.5">
                {protokoll.larare}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400">Underskrift elev</div>
              <div className="font-serif italic font-bold text-slate-900 border-b border-slate-400 px-3 pb-0.5">
                {protokoll.elevNamn}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
