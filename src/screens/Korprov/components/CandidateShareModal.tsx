import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  MessageSquare, 
  ExternalLink, 
  Smartphone,
  ShieldCheck,
  Send
} from 'lucide-react';
import { AppState } from '../../../types';
import { createCandidateShareLink, SharedProtocolSummary } from '../../../lib/shareProtocol';
import { triggerHaptic } from '../../../lib/utils';

interface CandidateShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  examinerName?: string;
}

export function CandidateShareModal({ isOpen, onClose, state, examinerName }: CandidateShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [shareId, setShareId] = useState('');
  const [summary, setSummary] = useState<SharedProtocolSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setGenerating(true);

    createCandidateShareLink(state, examinerName).then((res) => {
      if (isMounted) {
        setShareUrl(res.url);
        setQrCodeUrl(res.qrDataUrl);
        setShareId(res.id);
        setSummary(res.summary);
        setGenerating(false);
      }
    });

    return () => { isMounted = false; };
  }, [isOpen, state, examinerName]);

  if (!isOpen) return null;

  const handleCopy = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    triggerHaptic('medium');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Körprovsprotokoll – ${state.properties.studentName}`,
          text: `Hej ${state.properties.studentName}! Här är ditt digitala körprovsprotokoll:`,
          url: shareUrl,
        });
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  const smsBody = encodeURIComponent(`Hej ${state.properties.studentName || 'Kandidat'}! Här kan du se ditt digitala körprovsprotokoll: ${shareUrl}`);
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  const smsLink = cleanPhone ? `sms:${cleanPhone}?body=${smsBody}` : `sms:?body=${smsBody}`;
  const whatsappLink = cleanPhone 
    ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${smsBody}` 
    : `https://wa.me/?text=${smsBody}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                Dela länk med kandidaten
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Unik länk & QR-kod för kandidatvyn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {generating ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-[#002f6c] rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-gray-600 dark:text-slate-400">Skapar delningslänk & QR-kod...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Candidate summary pill */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {state.properties.studentName || 'Kandidat'}
                </span>
                <span className="text-gray-400 mx-1.5">•</span>
                <span className="font-semibold text-gray-600 dark:text-slate-300">
                  Behörighet {state.properties.licenseType}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                summary?.isPassed 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
              }`}>
                {summary?.isPassed ? 'Godkänd' : 'Ej godkänd'}
              </span>
            </div>

            {/* QR Code Section */}
            {qrCodeUrl && (
              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xs space-y-2 text-center">
                <div className="p-2 bg-white rounded-xl border border-gray-150 shadow-inner">
                  <img src={qrCodeUrl} alt="QR-kod för kandidatvy" className="w-44 h-44 object-contain rounded-lg" />
                </div>
                <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                  <Smartphone size={13} className="text-[#002f6c] dark:text-blue-400" />
                  <span>Kandidaten kan skanna QR-koden direkt med mobilkameran</span>
                </div>
              </div>
            )}

            {/* Copy Link Input Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Direktlänk till protokollet
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 h-10 px-3 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 font-mono truncate select-all outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`h-10 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#002f6c] hover:bg-[#00204a] text-white shadow-2xs'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Kopierad' : 'Kopiera'}</span>
                </button>
              </div>
            </div>

            {/* Free SMS direct send section */}
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#002f6c] dark:text-blue-300 flex items-center gap-1.5">
                  <MessageSquare size={13} />
                  <span>Skicka via SMS (Gratis via din enhet)</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  0 kr extra
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  placeholder="Kandidatens mobilnr (t.ex. 0701234567)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 h-9 px-3 text-xs bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-slate-200 outline-none focus:border-[#002f6c]"
                />
                <a
                  href={smsLink}
                  className="h-9 px-3 rounded-xl bg-[#002f6c] hover:bg-[#00204a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs"
                >
                  <Send size={12} />
                  <span>Öppna SMS</span>
                </a>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400 pt-0.5">
                <span>Skickas via din telefons vanliga fria SMS</span>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  Eller via WhatsApp
                </a>
              </div>
            </div>

            {/* Preview Candidate View Button */}
            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink size={14} />
                <span>Förhandsgranska kandidatvyn i ny flik</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
