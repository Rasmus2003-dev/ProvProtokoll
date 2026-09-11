import React, { useState } from 'react';
import { User, Key, LogIn, CheckCircle2, ShieldCheck, UserCheck, X } from 'lucide-react';
import { miniDb, UserRow } from '../lib/db';
import { useAppStore } from '../store/ProvContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { updateProfile, updateState } = useAppStore();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'manual' | 'supabase'>('quick');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(localStorage.getItem('supabase_url') || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(localStorage.getItem('supabase_anon_key') || '');
  const [supabaseSaved, setSupabaseSaved] = useState(false);

  if (!isOpen) return null;

  const users = miniDb.selectUsers();

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrlInput.trim()) localStorage.setItem('supabase_url', supabaseUrlInput.trim());
    if (supabaseKeyInput.trim()) localStorage.setItem('supabase_anon_key', supabaseKeyInput.trim());
    setSupabaseSaved(true);
    setTimeout(() => setSupabaseSaved(false), 3000);
  };

  const handleSelectUser = (u: UserRow) => {
    if (u.role === 'inspector') {
      updateProfile({
        name: u.name,
        email: u.email,
      });
      alert(`Inloggad som Inspektör: ${u.name}`);
    } else {
      updateState(prev => ({
        ...prev,
        properties: {
          ...prev.properties,
          studentName: u.name,
          personalNumber: u.personalNumber,
          email: u.email,
          licenseType: u.authClass || 'B',
        }
      }));
      alert(`Inloggad som Kandidat: ${u.name} (Behörighet ${u.authClass || 'B'})`);
    }
    onClose();
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = miniDb.findUserByPnrOrEmail(identifier);
    if (!found) {
      setError('Kunde inte hitta någon användare i SQL-databasen med de uppgifterna.');
      return;
    }

    if (found.pin !== pin) {
      setError('Felaktig PIN-kod. (Standard PIN: 1234)');
      return;
    }

    handleSelectUser(found);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border-0 sm:border border-gray-200 dark:border-slate-800 w-full max-w-lg h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="bg-[#002f6c] text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 pt-safe">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-base leading-tight truncate tracking-tight">ProvProtokoll Inloggning</h3>
              <p className="text-xs text-blue-200">Inspektör- & Kandidatautentisering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center min-w-10 min-h-10 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 mb-6 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('quick')}
              className={`pb-2.5 px-3 sm:px-4 min-h-10 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'quick'
                  ? 'border-[#002f6c] text-[#002f6c] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              Snabbval (SQL Registrerade)
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-2.5 px-3 sm:px-4 min-h-10 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'manual'
                  ? 'border-[#002f6c] text-[#002f6c] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              Manuell Inloggning
            </button>
            <button
              onClick={() => setActiveTab('supabase')}
              className={`pb-2.5 px-3 sm:px-4 min-h-10 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'supabase'
                  ? 'border-[#002f6c] text-[#002f6c] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
              }`}
            >
              Supabase / Backend
            </button>
          </div>

          {activeTab === 'quick' ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Välj en profil från SQL-databasen för att logga in som Inspektör eller Provdeltagare:
              </p>
              
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="p-3 bg-gray-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 rounded-xl flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        u.role === 'inspector' 
                          ? 'bg-[#002f6c] text-white' 
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {u.role === 'inspector' ? 'INSP' : u.authClass || 'KAND'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-[#002f6c] dark:group-hover:text-blue-400 transition-colors">
                          {u.name}
                        </div>
                        <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                          {u.personalNumber} • {u.role === 'inspector' ? 'Inspektör' : `Kandidat (${u.authClass || 'B'})`}
                        </div>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover:bg-[#002f6c] group-hover:text-white transition-colors">
                      Välj
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Personnummer eller E-post
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ÅÅÅÅMMDD-XXXX eller e-post"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  PIN-Kod (Standard: 1234)
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 outline-none dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 min-h-11 bg-[#002f6c] hover:bg-[#00204a] text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn size={16} />
                <span>Logga in</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
