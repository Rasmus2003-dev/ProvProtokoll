import { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { LICENSE_GUIDES } from '../data/licenseGuidesData';
import { LicenseGuideView } from './lathund/LicenseGuideView';
import { TdokViewer, docForLicense } from './lathund/TdokViewer';
import { useStoredState } from './lathund/Highlight';
import { Portal } from './Portal';

interface LathundModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDocId?: string;
  defaultLicense?: string;
}

export function LathundModal({ isOpen, onClose, defaultDocId, defaultLicense = 'B' }: LathundModalProps) {
  const [activeTab, setActiveTab] = useStoredState<'behorighet' | 'dokument'>('lathund-tab', 'behorighet');
  const [selectedLicense, setSelectedLicense] = useState<string>(LICENSE_GUIDES[defaultLicense] ? defaultLicense : 'B');

  useEffect(() => {
    if (defaultLicense && LICENSE_GUIDES[defaultLicense]) setSelectedLicense(defaultLicense);
  }, [defaultLicense]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Alla hooks ovanför – tidig retur först här
  if (!isOpen) return null;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-slate-50 dark:bg-slate-950 border-0 sm:border border-gray-200 dark:border-slate-800 w-full max-w-6xl h-[100dvh] sm:h-[92vh] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#002f6c] text-white px-3 sm:px-5 py-3 flex items-center justify-between gap-2 shrink-0 pt-safe">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <BookOpen className="w-5 h-5 text-blue-100" />
            </div>
            <h2 className="font-extrabold text-sm sm:text-base tracking-tight truncate">Lathund</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-blue-950/60 p-1 rounded-xl border border-blue-400/30">
              <button
                onClick={() => setActiveTab('behorighet')}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'behorighet' ? 'bg-white text-[#002f6c]' : 'text-blue-200 hover:text-white'}`}
              >
                Per behörighet
              </button>
              <button
                onClick={() => setActiveTab('dokument')}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'dokument' ? 'bg-white text-[#002f6c]' : 'text-blue-200 hover:text-white'}`}
              >
                Rutiner
              </button>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center min-w-10 min-h-10 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Stäng lathund"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col">
          {activeTab === 'behorighet' ? (
            <LicenseGuideView license={selectedLicense} onLicenseChange={setSelectedLicense} />
          ) : (
            <TdokViewer defaultDocId={defaultDocId || docForLicense(defaultLicense)} />
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}
