import React, { useState } from 'react';
import { Maximize2, X, Monitor, CheckCircle, Info } from 'lucide-react';
import { AppLogo } from '../../../components/icons/AppLogo';

export interface CompetenceArea {
  id: string;
  name: string;
  description: string;
  subDetails: string[];
  icon: React.ReactNode;
}

// Custom SVGs matching Trafikverket's tablet system exactly as in the photo
export const CompetenceIcons = {
  Fordonskannedom: (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#002f6c] dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4h14v4z" />
      <circle cx="7.5" cy="15" r="1.5" />
      <circle cx="16.5" cy="15" r="1.5" />
    </svg>
  ),
  Manovrering: (
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#002f6c] dark:bg-blue-600 flex items-center justify-center text-white shadow-xs">
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="3" x2="12" y2="9" />
        <line x1="4.2" y1="16.5" x2="9.4" y2="13.5" />
        <line x1="19.8" y1="16.5" x2="14.6" y2="13.5" />
      </svg>
    </div>
  ),
  Miljomedveten: (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C8 10 59 16.17 3.82 21.34l1.41 1.41c.39.39 1.02.39 1.41 0L12 17.41c6.26-6.26 6-12.41 5-9.41z" opacity="0" />
      <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.8 4.28 2.23 6.01L3.82 19.41c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.41-1.41C8.37 20.47 10.15 21 12 21c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9zm-1 14.5v-2.1c-2.03-.43-3.62-2.02-4.05-4.05H4.85c.48 3.19 3.07 5.72 6.15 6.15z" />
      <path d="M21 3C10.5 3 4 10 4 21c7 0 17-6.5 17-18z" />
    </svg>
  ),
  Trafikregler: (
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 dark:bg-red-700 flex items-center justify-center text-white shadow-xs">
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z" />
      </svg>
    </div>
  ),
  Trafiksakerhet: (
    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-700 dark:text-amber-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  )
};

export const KOMPETENS_OMRADEN: CompetenceArea[] = [
  {
    id: 'fordonskannedom',
    name: 'Fordonskännedom',
    description: 'Teknisk kontroll, säkerhetskontroll och instrumenthantering.',
    subDetails: [
      'Säkerhetskontroll (belysning, däck, bromsar, vätskor)',
      'Reglage och instrumentering',
      'Kännedom om fordonets funktioner & varningar'
    ],
    icon: CompetenceIcons.Fordonskannedom
  },
  {
    id: 'manovrering',
    name: 'Manövrering',
    description: 'Fysisk hantering, växlars användning, manöverprov och krypkorning.',
    subDetails: [
      'Körställning och pedalsamspel',
      'Backning, vändning, parkering & start i lutning',
      'Hastighetsanpassning & bromsteknik'
    ],
    icon: CompetenceIcons.Manovrering
  },
  {
    id: 'miljomedveten',
    name: 'Miljömedveten körning',
    description: 'Sparsam körning, växelval, framförhållning och tomgångskörning.',
    subDetails: [
      'Eco-driving och sparsam körning',
      'Rätt växelval och motorbromsning',
      'Framförhållning som minskar onödiga stopp'
    ],
    icon: CompetenceIcons.Miljomedveten
  },
  {
    id: 'trafikregler',
    name: 'Trafikregler',
    description: 'Tillämpning av vägmärken, väjningsregler, hastighetsgränser och placering.',
    subDetails: [
      'Väjningsplikt och högerregel',
      'Korsningar, cirkulationsplatser & körfältsbyten',
      'Vägmärken, signaler & vägmarkeringar'
    ],
    icon: CompetenceIcons.Trafikregler
  },
  {
    id: 'trafiksakerhet',
    name: 'Trafiksäkerhet och beteende',
    description: 'Riskmedvetenhet, avsökning, samspel och säkerhetsmarginaler.',
    subDetails: [
      'Uppmärksamhet & avsökning i trafikmiljön',
      'Samspel med oskyddade trafikanter & medtrafikanter',
      'Säkerhetsavstånd framåt och i sidled'
    ],
    icon: CompetenceIcons.Trafiksakerhet
  }
];

export function KompetensOmradenCard() {
  const [isAspirantModalOpen, setIsAspirantModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top Banner Box */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <h3 className="text-base font-black text-[#002f6c] dark:text-blue-400 tracking-tight">
                De 5 Kompetensområdena
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Provets helhetsbedömning baseras på följande fem områden enligt Transportstyrelsens föreskrifter.
            </p>
          </div>

          <button
            onClick={() => setIsAspirantModalOpen(true)}
            className="shrink-0 w-full sm:w-auto px-4 py-2.5 min-h-10 bg-[#002f6c] hover:bg-[#00204a] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] cursor-pointer"
          >
            <Monitor size={16} />
            <span>Visa för aspirant (Fullskärm)</span>
          </button>
        </div>

        {/* 5 Areas List Matching the photo */}
        <div className="mt-5 space-y-3">
          {KOMPETENS_OMRADEN.map((area, index) => (
            <div
              key={area.id}
              className="p-3.5 bg-gray-50/80 dark:bg-zinc-800/50 hover:bg-blue-50/40 dark:hover:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-800 transition-all flex items-center gap-4"
            >
              {/* Icon */}
              <div className="shrink-0 flex items-center justify-center w-10 h-10">
                {area.icon}
              </div>

              {/* Title & Desc */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 font-mono">0{index + 1}.</span>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-snug truncate">
                    {area.name}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {area.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN ASPIRANT PRESENTATION MODAL - TRAFIKVERKET CLEAN DESIGN */}
      {isAspirantModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#f4f6f9] dark:bg-slate-950 flex flex-col p-4 sm:p-8 animate-in fade-in duration-200 overflow-y-auto">
          
          {/* Top Bar: ProvProtokoll Aspirant Presentation */}
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4 shrink-0">
            <div className="flex items-center gap-4">
              <AppLogo variant="provprotokoll" size="sm" />
              <div className="hidden sm:block pl-2 border-l border-gray-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block">
                  Informationsvy för körkortsaspirant
                </span>
                <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  Körprovets fem kompetensområden
                </h2>
              </div>
            </div>

            <button
              onClick={() => setIsAspirantModalOpen(false)}
              className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold shadow-xs"
            >
              <X size={16} />
              <span>Stäng helskärm</span>
            </button>
          </div>

          {/* Aspirant View Body */}
          <div className="flex-1 max-w-5xl mx-auto w-full py-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 text-sm font-medium shadow-xs">
              Under körprovet genomför förarprövaren en samlad helhetsbedömning baserad på hur du tillämpar kunskaper och färdigheter inom följande fem kompetensområden enligt Transportstyrelsens föreskrifter:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KOMPETENS_OMRADEN.map((area, index) => (
                <div
                  key={area.id}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800/80 pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {area.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#c40000] block">
                            Område {index + 1}
                          </span>
                          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                            {area.name}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700">
                        0{index + 1}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                      {area.description}
                    </p>
                  </div>

                  {/* Key points */}
                  <div className="pt-2 space-y-1.5 border-t border-gray-100 dark:border-slate-800/60">
                    {area.subDetails.map((sub, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 text-xs font-medium text-gray-800 dark:text-gray-200">
                        <span className="text-[#c40000] font-bold shrink-0">•</span>
                        <span>{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-800 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 shrink-0">
            <span>Enstaka brister som är av liten betydelse för trafiksäkerheten leder ej till underkännande.</span>
            <button
              onClick={() => setIsAspirantModalOpen(false)}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#002f6c] hover:bg-[#00204a] text-white font-bold rounded-lg transition-all shadow-xs cursor-pointer"
            >
              Återgå till Provstart
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
