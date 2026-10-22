import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  /** Befintlig signatur som bild (data-URL) */
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  disabled?: boolean;
  label?: string;
}

// Enkel signaturyta för finger, penna eller mus. Signaturen sparas som PNG (data-URL).
export function SignaturePad({ value, onChange, disabled, label = 'Signera här' }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [empty, setEmpty] = useState(!value);

  // Skala ytan efter skärmens pixeltäthet och rita upp en sparad signatur
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f1b2d';
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, width, height);
      img.src = value;
      hasInk.current = true;
    }
    // Bara vid montering – value används som startvärde
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const point = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = point(e);
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
  };

  const move = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInk.current = true;
    if (empty) setEmpty(false);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasInk.current && canvasRef.current) onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    hasInk.current = false;
    setEmpty(true);
    onChange(undefined);
  };

  return (
    <div>
      <div className={`relative rounded-control border-2 border-dashed bg-white ${disabled ? 'border-line opacity-60' : 'border-ink-3/40'}`}>
        <canvas
          ref={canvasRef}
          aria-label={label}
          className="block w-full h-36 touch-none cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] text-slate-400">
            {label}
          </span>
        )}
        {/* Signaturlinje */}
        <span aria-hidden="true" className="pointer-events-none absolute left-5 right-5 bottom-7 border-b border-slate-300" />
      </div>
      <div className="mt-1.5 flex justify-end">
        <button
          type="button"
          onClick={clear}
          disabled={disabled || empty}
          className="h-9 px-2.5 rounded-control text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          <Eraser size={14} /> Rensa
        </button>
      </div>
    </div>
  );
}
