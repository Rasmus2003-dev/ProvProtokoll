import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { useBackToClose } from '../../../hooks/useBackToClose';
import { X, Monitor, ChevronDown, CarFront, Leaf, Signpost, ShieldCheck } from 'lucide-react';
import { AppLogo } from '../../../components/icons/AppLogo';
import { Portal } from '../../../components/Portal';

// Ratt i samma linjestil som övriga ikoner (finns inte i ikonbiblioteket)
function SteeringWheel(props: SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 14.2V21" />
      <path d="M9.9 11.4 3.4 9.8" />
      <path d="m14.1 11.4 6.5-1.6" />
    </svg>
  );
}

type Icon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

export interface CompetenceArea {
  id: string;
  name: string;
  /** Kort beskrivning, skriven till kandidaten */
  description: string;
  subDetails: string[];
  icon: Icon;
  /** Färgton för ikonen: bakgrund och förgrund */
  tone: string;
}

export const KOMPETENS_OMRADEN: CompetenceArea[] = [
  {
    id: 'fordonskannedom',
    name: 'Fordonskännedom',
    description: 'Du känner ditt fordon och kan kontrollera att det är säkert att köra.',
    subDetails: [
      'Göra en säkerhetskontroll – till exempel belysning, däck, bromsar och vätskor',
      'Använda reglage och instrument på rätt sätt',
      'Förstå fordonets varningslampor och stödsystem',
    ],
    icon: CarFront,
    tone: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    id: 'manovrering',
    name: 'Manövrering',
    description: 'Du hanterar fordonet mjukt, säkert och med kontroll.',
    subDetails: [
      'Bra körställning och samspel mellan pedaler och ratt',
      'Backa, vända, parkera och starta i backe',
      'Bromsa i tid och anpassa farten mjukt',
    ],
    icon: SteeringWheel,
    tone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
  {
    id: 'miljomedveten',
    name: 'Miljömedveten körning',
    description: 'Du kör sparsamt och planerar körningen så att det blir jämnt och lugnt.',
    subDetails: [
      'Välja rätt växel och använda motorbromsen',
      'Planera i god tid så att du slipper onödiga stopp',
      'Undvika tomgång och hårda accelerationer',
    ],
    icon: Leaf,
    tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    id: 'trafikregler',
    name: 'Trafikregler',
    description: 'Du följer reglerna och gör det tydligt för andra vad du tänker göra.',
    subDetails: [
      'Väjningsplikt, stopplikt och högerregeln',
      'Korsningar, cirkulationsplatser och körfältsbyten',
      'Vägmärken, trafiksignaler och vägmarkeringar',
    ],
    icon: Signpost,
    tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    id: 'trafiksakerhet',
    name: 'Trafiksäkerhet och beteende',
    description: 'Du ser riskerna i tid, samspelar med andra och håller bra marginaler.',
    subDetails: [
      'Ha uppsikt åt alla håll och upptäcka risker tidigt',
      'Ta hänsyn till gående, cyklister och andra trafikanter',
      'Hålla avstånd framåt och åt sidorna',
    ],
    icon: ShieldCheck,
    tone: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
];

function AreaIcon({ area, size = 'md' }: { area: CompetenceArea; size?: 'md' | 'lg' }) {
  const Icon = area.icon;
  return (
    <span className={`shrink-0 flex items-center justify-center rounded-[14px] ${area.tone} ${size === 'lg' ? 'w-16 h-16' : 'w-11 h-11'}`}>
      <Icon size={size === 'lg' ? 32 : 22} strokeWidth={2} />
    </span>
  );
}

export function KompetensOmradenCard() {
  const [presenting, setPresenting] = useState(false);
  const [openArea, setOpenArea] = useState<string | null>(null);
  // Androids bakåtknapp stänger öppna dialoger
  useBackToClose(presenting, () => setPresenting(false));

  // Esc stänger visningen för kandidaten
  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPresenting(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenting]);

  return (
    <div className="space-y-4">
      <section className="bg-surface border border-line rounded-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">De fem kompetensområdena</h2>
            <p className="text-[13px] text-ink-2 mt-0.5">
              Det här bedömer du under provet. Visa gärna kandidaten innan ni kör.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPresenting(true)}
            className="shrink-0 w-full sm:w-auto h-11 px-4 bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-control text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Monitor size={16} />
            Visa för kandidaten
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {KOMPETENS_OMRADEN.map((area) => {
            const open = openArea === area.id;
            return (
              <li key={area.id} className={`rounded-control border transition-colors ${open ? 'border-line bg-surface-2/60' : 'border-transparent hover:bg-surface-2/60'}`}>
                <button
                  type="button"
                  onClick={() => setOpenArea(open ? null : area.id)}
                  aria-expanded={open}
                  className="w-full p-2.5 flex items-center gap-3.5 text-left cursor-pointer"
                >
                  <AreaIcon area={area} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold text-ink leading-snug">{area.name}</span>
                    <span className={`block text-[13px] text-ink-2 mt-0.5 ${open ? '' : 'line-clamp-1'}`}>{area.description}</span>
                  </span>
                  <ChevronDown size={18} className={`shrink-0 text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <ul className="pb-3 pl-[70px] pr-3 space-y-1.5 animate-in fade-in duration-150">
                    {area.subDetails.map(sub => (
                      <li key={sub} className="flex gap-2.5 text-[14px] text-ink-2 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-ink-3 shrink-0" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <p className="text-[13px] text-ink-3 mt-3">
          Enstaka små misstag som inte påverkar trafiksäkerheten gör inte att kandidaten blir underkänd.
        </p>
      </section>

      {/* Helskärm att vända mot kandidaten */}
      {presenting && (
        <Portal>
          <div className="fixed inset-0 z-[120] bg-white dark:bg-slate-950 overflow-y-auto animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="kompetens-titel">
            <div className="max-w-5xl mx-auto px-5 sm:px-10 py-6 sm:py-10 min-h-full flex flex-col">
              <div className="flex items-center justify-between gap-4">
                <AppLogo variant="provprotokoll" size="md" />
                <button
                  type="button"
                  onClick={() => setPresenting(false)}
                  aria-label="Stäng"
                  className="w-11 h-11 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-8 sm:mt-12 max-w-2xl">
                <h2 id="kompetens-titel" className="text-3xl sm:text-5xl font-bold text-gray-950 dark:text-white leading-tight">
                  Det här tittar vi på under provet
                </h2>
                <p className="mt-3 text-lg sm:text-xl text-gray-600 dark:text-slate-300 leading-relaxed">
                  Du bedöms som helhet utifrån fem områden. Du behöver inte köra perfekt – det viktiga är att du kör säkert.
                </p>
              </div>

              <ol className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {KOMPETENS_OMRADEN.map((area, i) => (
                  <li key={area.id} className={`rounded-[24px] border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900 p-5 sm:p-6 ${i === KOMPETENS_OMRADEN.length - 1 ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-start gap-4">
                      <AreaIcon area={area} size="lg" />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-gray-400 dark:text-slate-500 tabular-nums">{i + 1}</span>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white leading-snug">{area.name}</h3>
                        <p className="mt-1 text-base sm:text-lg text-gray-700 dark:text-slate-300 leading-relaxed">{area.description}</p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 pl-1">
                      {area.subDetails.map(sub => (
                        <li key={sub} className="flex gap-3 text-[15px] sm:text-base text-gray-700 dark:text-slate-300 leading-relaxed">
                          <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>

              <div className="mt-auto pt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setPresenting(false)}
                  className="h-12 px-8 rounded-full bg-navy hover:bg-navy-deep dark:bg-blue-600 text-white font-semibold text-[15px] cursor-pointer"
                >
                  Klar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
