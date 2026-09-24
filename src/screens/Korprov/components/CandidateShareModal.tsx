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
  Send, 
  Globe, 
  Info,
  CheckCircle2,
  XCircle
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
  const [activeTab, setActiveTab] = useState<'qr' | 'sms' | 'whatsapp'>('qr');

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
          title: `Körprovsprotokoll – ${state.properties.studentName || 'Kandidat'}`,
          text: `Hej ${state.properties.studentName || 'Kandidat'}! Här är ditt digitala körprovsprotokoll:`,
          url: shareUrl,
        });
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  const smsText = `Hej ${state.properties.studentName || 'Kandidat'}! Här kan du se ditt officiella körprovsprotokoll: ${shareUrl}`;
  const smsBody = encodeURIComponent(smsText);
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  const smsLink = cleanPhone ? `sms:${cleanPhone}?body=${smsBody}` : `sms:?body=${smsBody}`;
  const whatsappLink = cleanPhone 
    ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${smsBody}` 
    : `https://wa.me/?text=${smsBody}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col space-y-4 max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                Dela protokoll med kandidaten
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Välj det delningssätt som passar bäst – alltid 100 % kostnadsfritt
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
            <p className="text-xs font-bold text-gray-600 dark:text-slate-400">Skapar säker delningslänk och QR-kod...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Candidate summary pill */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
              summary?.isPassed
                ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50'
                : 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50'
            }`}>
              <div className="flex items-center gap-2">
                {summary?.isPassed ? (
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {state.properties.studentName || 'Kandidat'}
                  </span>
                  <span className="text-gray-400 mx-1.5">•</span>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">
                    Behörighet {state.properties.licenseType}
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                summary?.isPassed 
                  ? 'bg-emerald-600 text-white shadow-2xs' 
                  : 'bg-rose-600 text-white shadow-2xs'
              }`}>
                {summary?.isPassed ? 'Godkänd' : 'Underkänd'}
              </span>
            </div>

            {/* Delningssätt Tabbar */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setActiveTab('qr'); }}
                className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'qr'
                    ? 'bg-white dark:bg-slate-700 text-[#002f6c] dark:text-blue-300 shadow-2xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Smartphone size={14} />
                <span>1. Skanna QR</span>
              </button>

              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setActiveTab('sms'); }}
                className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'sms'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare size={14} />
                <span>2. SMS (Sverige)</span>
              </button>

              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setActiveTab('whatsapp'); }}
                className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'whatsapp'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Globe size={14} />
                <span>3. Utländska nr</span>
              </button>
            </div>

            {/* TAB CONTENT 1: QR CODE */}
            {activeTab === 'qr' && (
              <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 flex flex-col items-center text-center space-y-3 animate-in fade-in duration-100">
                <div className="bg-white p-3 rounded-2xl border border-gray-200 dark:border-slate-600 shadow-xs">
                  <img src={qrCodeUrl} alt="QR-kod för kandidatvy" className="w-40 h-40 object-contain rounded-lg" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
                    <Smartphone size={14} className="text-[#002f6c] dark:text-blue-400" />
                    <span>Låt kandidaten skanna med mobilkameran</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 max-w-xs">
                    Bästa alternativet på plats i bilen! Eleven scannar QR-koden direkt från din skärm. Kräver varken telefonnummer eller app.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: SMS (SWEDISH) */}
            {activeTab === 'sms' && (
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200/70 dark:border-blue-900/40 space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#002f6c] dark:text-blue-300 flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    <span>Skicka SMS till svenskt mobilnummer</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                    0 kr – Fria SMS via din enhet
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-slate-300">
                    Kandidatens mobilnummer (valfritt – kan även väljas i telefonen):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      placeholder="070-123 45 67"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-slate-200 outline-none focus:border-[#002f6c]"
                    />
                    <a
                      href={smsLink}
                      className="h-10 px-4 rounded-xl bg-[#002f6c] hover:bg-[#00204a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Öppna SMS</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-slate-400 bg-white/70 dark:bg-slate-800/70 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Öppnar din enhets vanliga SMS-app med färdigskrivet meddelande och protokollänk. Kostar ingenting extra då det går på ditt vanliga mobilabonnemang.
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: WHATSAPP / FOREIGN NUMBERS */}
            {activeTab === 'whatsapp' && (
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Globe size={14} className="text-emerald-600" />
                    <span>Utländska nummer & Internationella elever</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                    100 % Gratis över internet
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 dark:text-slate-300">
                  Vanliga SMS från svenska mobiler till utländska nummer debiteras utlandstaxa. <strong>WhatsApp går via internet och är 100 % gratis</strong> till alla länder i världen!
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-slate-300">
                    Utländskt mobilnummer med landskod (t.ex. +47, +45, +49):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      placeholder="+47 123 45 678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-slate-200 outline-none focus:border-emerald-600"
                    />
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Skicka WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  💡 Tips: Eleven kan även skanna QR-koden i flik 1 helt kostnadsfritt!
                </div>
              </div>
            )}

            {/* Direktlänk & Enhetsdelning (Alltid synlig längst ner) */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Direktlänk till protokollet
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 font-mono truncate select-all outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 shadow-2xs'
                  }`}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Kopierad!' : 'Kopiera länk'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex-1 py-2 px-3 bg-gray-200/80 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>Dela via enhetens meny (AirDrop / Mail m.m.)</span>
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-[#002f6c] dark:text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
                  title="Öppna kandidatvyn i ny webbläsarflik"
                >
                  <ExternalLink size={13} />
                  <span>Testa länk</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
