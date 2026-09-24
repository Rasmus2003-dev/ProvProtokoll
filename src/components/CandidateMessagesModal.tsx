import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  CheckCheck, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  User, 
  Mail, 
  PlusCircle, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  CandidateMessage, 
  getMessagesForCandidate, 
  markMessagesAsReadForCandidate, 
  recordInboundMessage 
} from '../lib/candidateMessages';
import { triggerHaptic } from '../lib/utils';
import { useToast } from './Toast';

interface CandidateMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    name: string;
    personalNumber?: string;
    email?: string;
    phone?: string;
    licenseType?: string;
  } | null;
  onReply: (data: { to: string; toName: string; subject: string }) => void;
}

export function CandidateMessagesModal({ isOpen, onClose, candidate, onReply }: CandidateMessagesModalProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<CandidateMessage[]>([]);
  const [simulatedText, setSimulatedText] = useState('');
  const [showSimulateForm, setShowSimulateForm] = useState(false);

  const loadMessages = () => {
    if (!candidate) return;
    const msgs = getMessagesForCandidate({
      email: candidate.email,
      personalNumber: candidate.personalNumber,
      name: candidate.name,
    });
    setMessages(msgs);
  };

  useEffect(() => {
    if (!isOpen || !candidate) return;
    loadMessages();
    markMessagesAsReadForCandidate({
      email: candidate.email,
      personalNumber: candidate.personalNumber,
      name: candidate.name,
    });

    const handler = () => loadMessages();
    window.addEventListener('candidate_messages_updated', handler);
    return () => window.removeEventListener('candidate_messages_updated', handler);
  }, [isOpen, candidate]);

  if (!isOpen || !candidate) return null;

  const candidateEmail = candidate.email || 'kandidat@exempel.se';
  const lastMsg = messages[messages.length - 1];
  const replySubject = lastMsg?.subject
    ? (lastMsg.subject.startsWith('Sv:') ? lastMsg.subject : `Sv: ${lastMsg.subject}`)
    : 'Angående ditt förarprov – ProvProtokoll';

  const handleSimulateReply = (presetText?: string) => {
    const textToSend = presetText || simulatedText.trim();
    if (!textToSend) return;

    triggerHaptic('medium');
    recordInboundMessage({
      candidateEmail: candidate.email || 'Rasmus.03@hotmail.se',
      candidateName: candidate.name,
      candidatePersonalNumber: candidate.personalNumber,
      subject: replySubject,
      body: textToSend,
    });

    setSimulatedText('');
    setShowSimulateForm(false);
    showToast(`Inkommet svar från ${candidate.name} registrerat!`, 'info');
    loadMessages();
  };

  const handleStartReply = () => {
    triggerHaptic('light');
    onClose();
    onReply({
      to: candidate.email || '',
      toName: candidate.name,
      subject: replySubject,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-2xs">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                  Mejldialog & Svar
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-[#002f6c] dark:text-blue-300 text-[10px] font-extrabold rounded-md uppercase">
                  {candidate.name}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-mono">
                {candidate.email || 'Ingen e-post sparad'} {candidate.personalNumber ? `• ${candidate.personalNumber}` : ''}
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

        {/* Message Thread */}
        <div className="py-4 overflow-y-auto space-y-3.5 flex-1 pr-1 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-gray-400">
                <Mail size={24} />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-slate-300">
                Inga meddelanden skickade eller mottagna ännu för denna kandidat.
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                När du skickar ett provprotokoll eller fritextmejl till kandidaten hamnar det här, och inkomna svar visas automatiskt.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isInbound = msg.direction === 'inbound';
              const dateStr = new Date(msg.timestamp).toLocaleString('sv-SE', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-semibold text-gray-400">
                    <span>{isInbound ? `Svar från ${msg.sender.split('<')[0].trim()}` : 'Skickat från ProvProtokoll'}</span>
                    <span>•</span>
                    <span>{dateStr}</span>
                    {!isInbound && <CheckCheck size={13} className="text-blue-500" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                      isInbound
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-gray-900 dark:text-slate-100 rounded-tl-xs'
                        : 'bg-[#002f6c] dark:bg-blue-600 text-white border-transparent rounded-tr-xs shadow-md'
                    }`}
                  >
                    {msg.subject && (
                      <div className={`text-xs font-black mb-1.5 pb-1 border-b ${
                        isInbound ? 'text-emerald-900 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50' : 'text-blue-100 border-white/15'
                      }`}>
                        {msg.subject}
                      </div>
                    )}
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.body}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Simulate Reply Testing Drawer */}
        {showSimulateForm ? (
          <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Simulera inkommet svar från {candidate.name}:
              </span>
              <button
                type="button"
                onClick={() => setShowSimulateForm(false)}
                className="text-[11px] text-gray-400 hover:text-gray-600"
              >
                Stäng
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulateReply('Hej! Tack för beskedet. När kommer mitt plastkort på posten?')}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-[11px] font-medium hover:border-blue-400 transition-colors cursor-pointer"
              >
                "När kommer plastkortet?"
              </button>
              <button
                type="button"
                onClick={() => handleSimulateReply('Hej! Jag undrar om ni har någon ledig tid för omprov nästa vecka?')}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-[11px] font-medium hover:border-blue-400 transition-colors cursor-pointer"
              >
                "Ledig tid för omprov?"
              </button>
              <button
                type="button"
                onClick={() => handleSimulateReply('Tack så mycket för lektionen idag! Jag har tränat på backningen hemma nu.')}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-[11px] font-medium hover:border-blue-400 transition-colors cursor-pointer"
              >
                "Tack för lektionen!"
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={simulatedText}
                onChange={(e) => setSimulatedText(e.target.value)}
                placeholder="Eller skriv ett eget provsvar från kandidaten..."
                className="flex-1 h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleSimulateReply()}
                disabled={!simulatedText.trim()}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                Skicka in
              </button>
            </div>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSimulateForm(!showSimulateForm)}
              className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Testa hur det ser ut när eleven svarar på mejlet"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Testa inkommet svar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Stäng
            </button>

            <button
              type="button"
              onClick={handleStartReply}
              className="px-5 py-2.5 bg-gradient-to-r from-[#002f6c] to-blue-700 hover:from-[#00204a] hover:to-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Send size={14} />
              <span>Svara {candidate.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
