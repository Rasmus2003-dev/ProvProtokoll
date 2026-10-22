import { useEffect, useRef, useState } from 'react';
import { useBackToClose } from '../hooks/useBackToClose';
import { X, ScanLine, CheckCircle2, AlertTriangle, CameraOff, Loader2 } from 'lucide-react';
import { Portal } from './Portal';
import { triggerHaptic } from '../lib/utils';

// Simulerad skanning av kandidatens körkort. Kameran används om den finns
// (och läser QR-koder där webbläsaren stödjer det), annars simuleras
// skanningen. Resultatet fyller i identitetskontrollen.

export interface ScanResult {
  idType: string;
  idNumber: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  personalNumber: string;
  license: string;
  onResult: (result: ScanResult) => void;
}

type Phase = 'scanning' | 'reading' | 'done';

// Samma personnummer ger alltid samma påhittade körkortsnummer
function fakeLicenseNumber(pnr: string): string {
  let h = 7;
  for (const ch of pnr.replace(/\D/g, '')) h = (h * 31 + Number(ch)) % 99999991;
  return String(10000000 + (h % 89999999));
}

export function LicenseScanModal({ open, onClose, candidateName, personalNumber, license, onResult }: Props) {
  // Androids bakåtknapp stänger dialogen
  useBackToClose(open, onClose);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>('scanning');
  const [cameraState, setCameraState] = useState<'starting' | 'on' | 'off'>('starting');
  const [session, setSession] = useState(0); // ökas för att skanna igen

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const finishScan = () => {
    setPhase('reading');
    triggerHaptic('medium');
    window.setTimeout(() => { setPhase('done'); triggerHaptic('success'); stopCamera(); }, 1100);
  };

  // Starta kameran och leta efter en kod när rutan öppnas
  useEffect(() => {
    if (!open) return;
    setPhase('scanning');
    setCameraState('starting');
    let cancelled = false;
    let timer: number | undefined;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('ingen kamera');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraState('on');

        const Detector = (window as any).BarcodeDetector;
        if (Detector) {
          const detector = new Detector({ formats: ['qr_code', 'pdf417', 'code_128'] });
          const tick = async () => {
            if (cancelled || !videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) { finishScan(); return; }
            } catch { /* försök igen */ }
            timer = window.setTimeout(tick, 400);
          };
          tick();
        }
      } catch {
        if (!cancelled) setCameraState('off');
      }
    })();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session]);

  if (!open) return null;

  const licenseNumber = fakeLicenseNumber(personalNumber || candidateName);
  const validTo = new Date(new Date().setFullYear(new Date().getFullYear() + 7)).toLocaleDateString('sv-SE');
  const hasPnr = personalNumber.replace(/\D/g, '').length >= 10;

  const close = () => { stopCamera(); onClose(); };

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/70 backdrop-blur-sm" onClick={close}>
        <div role="dialog" aria-modal="true" aria-labelledby="scan-title" className="w-full sm:max-w-md bg-surface border border-line rounded-t-sheet sm:rounded-card shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
            <h3 id="scan-title" className="text-lg font-semibold text-ink flex items-center gap-2">
              <ScanLine size={18} className="text-ink-3" /> Skanna körkortet
            </h3>
            <button type="button" onClick={close} aria-label="Stäng" className="w-10 h-10 -mr-2 rounded-full hover:bg-surface-2 flex items-center justify-center text-ink-3 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {phase !== 'done' ? (
            <div className="px-5 pb-5">
              {/* Kameravy med sökram */}
              <div className="relative aspect-[1.586] rounded-control overflow-hidden bg-slate-900">
                <video ref={videoRef} playsInline muted className={`absolute inset-0 w-full h-full object-cover ${cameraState === 'on' ? '' : 'hidden'}`} />
                {cameraState !== 'on' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 text-[13px]">
                    {cameraState === 'starting' ? <Loader2 size={22} className="animate-spin" /> : <CameraOff size={22} />}
                    {cameraState === 'starting' ? 'Startar kameran…' : 'Ingen kamera – använd simuleringen nedan'}
                  </div>
                )}
                {/* Hörnmarkeringar och svepande linje */}
                <div className="absolute inset-[12%] pointer-events-none">
                  {['top-0 left-0 border-t-4 border-l-4 rounded-tl-lg', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg'].map(c => (
                    <span key={c} className={`absolute w-7 h-7 border-white/90 ${c}`} />
                  ))}
                  {phase === 'scanning' && <span className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_2px_rgb(52_211_153/0.7)] animate-[scanline_1.8s_ease-in-out_infinite]" />}
                </div>
                {phase === 'reading' && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-2 text-white text-sm font-medium">
                    <Loader2 size={18} className="animate-spin" /> Läser körkortet…
                  </div>
                )}
              </div>
              <p className="mt-3 text-[13px] text-ink-2 leading-relaxed">
                Håll körkortets baksida i ramen. Koden läses automatiskt.
              </p>
              <button
                type="button"
                onClick={finishScan}
                disabled={phase === 'reading'}
                className="mt-3 w-full h-11 rounded-control border border-line text-ink hover:bg-surface-2 text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                Simulera skanning
              </button>
            </div>
          ) : (
            <div className="px-5 pb-5 animate-in fade-in duration-150">
              <div className={`rounded-control border p-4 ${hasPnr ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/20' : 'border-amber-300 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-950/20'}`}>
                <p className={`text-sm font-semibold flex items-center gap-2 ${hasPnr ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                  {hasPnr ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                  {hasPnr ? 'Körkortet stämmer med bokningen' : 'Personnummer saknas i bokningen – jämför själv'}
                </p>
                <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[14px]">
                  {[
                    ['Legitimation', 'Svenskt körkort'],
                    ['Namn', candidateName || '–'],
                    ['Personnummer', personalNumber || '–'],
                    ['Körkortsnummer', licenseNumber],
                    ['Giltigt till', validTo],
                    ['Körkortstillstånd', `${license} – giltigt`],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className="text-ink font-medium tabular-nums truncate">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <p className="mt-3 text-[13px] text-ink-2">Jämför fotot på körkortet med kandidaten innan du går vidare.</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setSession(n => n + 1)} className="h-11 px-4 rounded-control border border-line text-ink-2 hover:text-ink hover:bg-surface-2 text-sm font-medium cursor-pointer">
                  Skanna igen
                </button>
                <button
                  type="button"
                  onClick={() => { onResult({ idType: 'Svenskt körkort', idNumber: licenseNumber }); close(); }}
                  className="flex-1 h-11 rounded-control bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer"
                >
                  Använd uppgifterna
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
