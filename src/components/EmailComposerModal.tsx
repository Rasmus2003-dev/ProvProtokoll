import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Check, 
  Loader2, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Sparkles,
  Eye,
  EyeOff,
  User,
  Building2,
  AlertCircle
} from 'lucide-react';
import { 
  EMAIL_TEMPLATES, 
  EmailTemplateType, 
  generateTemplateEmailHtml, 
  sendSystemEmail 
} from '../lib/emailTemplates';
import { triggerHaptic } from '../lib/utils';
import { useToast } from './Toast';

export interface EmailComposerInitialData {
  to?: string;
  toName?: string;
  licenseType?: string;
  testDate?: string;
  bookingTime?: string;
  examiner?: string;
  result?: string;
  initialTemplate?: EmailTemplateType;
}

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: EmailComposerInitialData;
}

export function EmailComposerModal({ isOpen, onClose, initialData }: EmailComposerModalProps) {
  const { showToast } = useToast();

  const [to, setTo] = useState('');
  const [toName, setToName] = useState('');
  const [templateType, setTemplateType] = useState<EmailTemplateType>('kallelse');
  const [licenseType, setLicenseType] = useState('B');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [location, setLocation] = useState('Förarprovskontoret');
  const [examiner, setExaminer] = useState('Trafikinspektör');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setTo(initialData?.to || '');
    setToName(initialData?.toName || '');
    setLicenseType(initialData?.licenseType || 'B');
    setTestDate(initialData?.testDate || new Date().toISOString().split('T')[0]);
    setBookingTime(initialData?.bookingTime || '09:00');
    setExaminer(initialData?.examiner || 'Trafikinspektör');
    if (initialData?.initialTemplate) {
      setTemplateType(initialData.initialTemplate);
    }
    setSendError(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const currentTemplate = EMAIL_TEMPLATES.find(t => t.id === templateType) || EMAIL_TEMPLATES[0];

  const generated = generateTemplateEmailHtml({
    to,
    toName: toName.trim() || 'Kandidat',
    templateType,
    licenseType,
    testDate,
    bookingTime,
    location,
    examiner,
    result: initialData?.result || 'Godkänt',
    customSubject: customSubject.trim() || undefined,
    customMessage: customMessage.trim() || undefined,
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) {
      setSendError('Ange mottagarens e-postadress.');
      return;
    }

    triggerHaptic('medium');
    setIsSending(true);
    setSendError(null);

    const res = await sendSystemEmail({
      to: to.trim(),
      toName: toName.trim() || undefined,
      subject: generated.subject,
      html: generated.html,
    });

    setIsSending(false);

    if (res.success) {
      triggerHaptic('heavy');
      showToast(`Mejlet "${generated.subject}" skickades till ${to}!`, 'success');
      onClose();
    } else {
      setSendError(res.error || 'Kunde inte skicka mejlet.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-2xs">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                Skicka e-post från ProvProtokoll
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Kallelser, påminnelser, intyg eller anpassat meddelande
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Template Selector Pills */}
        <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto hide-scrollbar border-b border-gray-100 dark:border-slate-800 shrink-0">
          {EMAIL_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setTemplateType(tmpl.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                templateType === tmpl.id
                  ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] shadow-xs'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
              }`}
            >
              {tmpl.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="py-3.5 overflow-y-auto space-y-4 flex-1 pr-1 custom-scrollbar">
          
          {sendError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Mottagarens namn
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="Kandidatens namn..."
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Mottagarens e-postadress *
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="elev@exempel.se"
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Template-specific details (Kallelse / Påminnelse / Intyg) */}
          {(templateType === 'kallelse' || templateType === 'paminnelse' || templateType === 'intyg') && (
            <div className="p-3.5 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-150 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Behörighet</label>
                <input
                  type="text"
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value.toUpperCase())}
                  className="w-full h-9 px-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Datum</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full h-9 px-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Klockslag</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full h-9 px-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plats</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Förarprovskontoret"
                  className="w-full h-9 px-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Custom Subject & Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                {templateType === 'custom' ? 'Ämne (Subject)' : 'Valfri kommentar / extra notering'}
              </label>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[11px] font-bold text-[#002f6c] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPreview ? 'Dölj förhandsvisning' : 'Förhandsgranska HTML-mejl'}</span>
              </button>
            </div>

            {templateType === 'custom' && (
              <>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder={currentTemplate.defaultSubject}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:border-blue-500 font-bold"
                />

                {/* Snabbmallar / Snabbknappar för fritext */}
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">Förslag:</span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setCustomSubject('Viktig information inför din körning');
                      setCustomMessage('Hej!\n\nInför din kommande körning vill vi påminna om att ta med giltig fysisk ID-handling (eller godkänt Freja eID+).\n\nVänligen anländ minst 15 minuter innan utsatt starttid så att vi hinner gå igenom förberedelser i lugn och ro.\n\nVarmt välkommen!');
                    }}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-300 rounded-lg text-[11px] font-semibold transition-all shrink-0 border border-blue-200 dark:border-blue-900/40 cursor-pointer"
                  >
                    🚗 Inför körning
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setCustomSubject('Sammanfattning och övningspunkter från dagens lektion');
                      setCustomMessage('Hej!\n\nTack för en bra insats under dagens körning. Här kommer en kort sammanfattning av vad vi övade på och vad du bör fokusera på till nästa gång:\n\n• Avsökning och blick framåt i cirkulationsplatser.\n• Planering av fartanpassning och motorbroms.\n• Säkerhetskontroll (yttre och inre kontroll).\n\nFortsätt det fina arbetet så ses vi snart igen!');
                    }}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-300 rounded-lg text-[11px] font-semibold transition-all shrink-0 border border-blue-200 dark:border-blue-900/40 cursor-pointer"
                  >
                    📋 Lektionsuppföljning
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setCustomSubject('Ändring av bokad tid');
                      setCustomMessage('Hej!\n\nVi har uppdaterat din inbokade tid. Vänligen kontrollera den nya tiden och återkom omgående om tiden inte passar dig.');
                    }}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-300 rounded-lg text-[11px] font-semibold transition-all shrink-0 border border-blue-200 dark:border-blue-900/40 cursor-pointer"
                  >
                    ⏰ Tidsändring
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setCustomSubject('Komplettering av underlag');
                      setCustomMessage('Hej!\n\nVi behöver komplettera dina uppgifter inför registrering av ditt prov. Vänligen kontakta oss snarast.');
                    }}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-300 rounded-lg text-[11px] font-semibold transition-all shrink-0 border border-blue-200 dark:border-blue-900/40 cursor-pointer"
                  >
                    📄 Komplettering
                  </button>
                </div>
              </>
            )}

            <textarea
              rows={templateType === 'custom' ? 6 : 3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={templateType === 'custom' ? 'Skriv ditt meddelande här... Du kan skriva flera stycken med blankrader emellan.' : 'Lägg till eventuellt särskilt meddelande...'}
              className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:border-blue-500 leading-relaxed resize-none"
            />

            {templateType === 'custom' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Avsändare undertecknas som:</span>
                <input
                  type="text"
                  value={examiner}
                  onChange={(e) => setExaminer(e.target.value)}
                  placeholder="T.ex. Trafiklärare / Trafikinspektör"
                  className="flex-1 h-8 px-2.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Live Preview Drawer */}
          {showPreview && (
            <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-slate-400">
                <span>Ämne: <strong className="text-gray-900 dark:text-white">{generated.subject}</strong></span>
                <span>Avsändare: info@rasmusl.se</span>
              </div>
              <div 
                className="bg-white rounded-xl p-4 shadow-inner max-h-60 overflow-y-auto border border-gray-200 text-black"
                dangerouslySetInnerHTML={{ __html: generated.html }}
              />
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="pt-3.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Avbryt
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !to.trim()}
            className="flex-1 py-2.5 px-5 bg-gradient-to-r from-[#002f6c] to-blue-700 hover:from-[#00204a] hover:to-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
            <span>{isSending ? 'Skickar mejl...' : `Skicka ${currentTemplate.label.split('/')[0].trim()}`}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
