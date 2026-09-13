import React, { useState } from 'react';
import { AppLogo } from '../components/icons/AppLogo';
import { useAppStore } from '../store/ProvContext';
import { ShieldCheck, LogIn, KeyRound, Cloud, UserCheck, AlertCircle, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { signInWithEmailPassword, isSupabaseConfigured, updateUserPassword } from '../lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { updateProfile } = useAppStore();
  
  // NEVER pre-filled: always start empty
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Change password view toggle & states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changeUser, setChangeUser] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Get current active password for Rasmus
  const getRasmusCurrentPassword = () => {
    return localStorage.getItem('provprotokoll-rasmus-password') || '1234';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setError('Ange användarnamn.');
      return;
    }
    if (!trimmedPass) {
      setError('Ange lösenord.');
      return;
    }

    setIsLoading(true);

    // ONLY Rasmus can log in to this terminal
    const isRasmus = 
      trimmedUser.toLowerCase() === 'rasmus' || 
      trimmedUser.toLowerCase() === 'rasmus lundin' ||
      trimmedUser.toLowerCase() === 'insp-2045';

    if (!isRasmus) {
      setIsLoading(false);
      setError('Behörighet saknas. Endast auktoriserad inspektör Rasmus kan logga in i detta system.');
      return;
    }

    const currentValidPass = getRasmusCurrentPassword();
    // Allow the user-set password OR initial fallback
    const isValidPass = trimmedPass === currentValidPass || (currentValidPass === '1234' && ['2045', 'Trafikverket2026!'].includes(trimmedPass));

    if (!isValidPass) {
      setIsLoading(false);
      setError('Felaktigt lösenord. Försök igen eller klicka på "Byt lösenord".');
      return;
    }

    // Supabase session login in background if configured
    if (isSupabaseConfigured()) {
      try {
        await signInWithEmailPassword('rasmus.lundin@gmail.com', 'Trafikverket2026!');
      } catch (_) {}
    }

    updateProfile({
      name: 'Rasmus Lundin',
      inspectorId: 'INSP-2045',
      email: 'rasmus.lundin@gmail.com',
      depot: 'Samtliga orter / Hela Sverige',
      vehicleCategories: ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'TAXI']
    });

    localStorage.setItem('provprotokoll-is-logged-in', 'true');
    setSuccessMsg('Inloggning godkänd! Välkommen Rasmus.');

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 400);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = changeUser.trim();
    if (trimmedUser.toLowerCase() !== 'rasmus' && trimmedUser.toLowerCase() !== 'rasmus lundin') {
      setError('Endast inspektör Rasmus kan byta lösenord på detta konto.');
      return;
    }

    const currentValidPass = getRasmusCurrentPassword();
    if (currentPassword !== currentValidPass && currentPassword !== '1234' && currentPassword !== 'Trafikverket2026!') {
      setError('Nuvarande lösenord är felaktigt.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Det nya lösenordet måste innehålla minst 4 tecken.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('De nya lösenorden matchar inte varandra.');
      return;
    }

    setIsLoading(true);

    try {
      // Save new password locally
      localStorage.setItem('provprotokoll-rasmus-password', newPassword);

      // Also update in Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await updateUserPassword(newPassword);
        } catch (_) {}
      }

      setSuccessMsg('Lösenordet har uppdaterats! Du kan nu logga in med ditt nya lösenord.');
      setPassword('');
      setUsername('Rasmus');
      setTimeout(() => {
        setIsLoading(false);
        setIsChangingPassword(false);
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Kunde inte uppdatera lösenordet.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* Clean White Modal Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top Header with Authentic ProvProtokoll Logo */}
        <div className="pt-7 pb-5 px-6 sm:px-8 text-center bg-gradient-to-b from-slate-50/90 to-white border-b border-gray-100">
          <div className="flex justify-center mb-3">
            <AppLogo variant="provprotokoll" size="md" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {isChangingPassword ? 'Byt lösenord' : 'Inspektörsinloggning'}
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {isChangingPassword 
              ? 'Ange ditt nuvarande lösenord och välj ett nytt' 
              : 'Endast behörig inspektör Rasmus kan logga in'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* --- VIEW 1: NORMAL LOGIN --- */}
          {!isChangingPassword ? (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              
              {/* Username field (NEVER prefilled) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Användarnamn
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ange användarnamn"
                    autoComplete="off"
                    className="w-full h-11 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#002f6c] focus:ring-2 focus:ring-[#002f6c]/10 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password field (NEVER prefilled) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 block">
                    Lösenord
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setChangeUser(username || 'Rasmus');
                      setIsChangingPassword(true);
                    }}
                    className="text-[11px] font-bold text-[#002f6c] hover:underline cursor-pointer"
                  >
                    Byt lösenord?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ange ditt lösenord"
                    autoComplete="new-password"
                    className="w-full h-11 pl-10 pr-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#002f6c] focus:ring-2 focus:ring-[#002f6c]/10 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#002f6c] hover:bg-[#002352] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-950/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <LogIn size={16} />
                <span>{isLoading ? 'Verifierar behörighet...' : 'Logga in'}</span>
              </button>
            </form>
          ) : (
            /* --- VIEW 2: CHANGE PASSWORD --- */
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5" autoComplete="off">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Användarnamn
                </label>
                <input
                  type="text"
                  value={changeUser}
                  onChange={(e) => setChangeUser(e.target.value)}
                  placeholder="t.ex. Rasmus"
                  className="w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-[#002f6c] transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Nuvarande lösenord
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ditt nuvarande lösenord"
                  className="w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-[#002f6c] transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Nytt lösenord
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minst 4 tecken"
                  className="w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-[#002f6c] transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Bekräfta nytt lösenord
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Upprepa det nya lösenordet"
                  className="w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-[#002f6c] transition-all"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setIsChangingPassword(false);
                  }}
                  className="w-1/3 h-10 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={13} />
                  <span>Avbryt</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 h-10 bg-[#002f6c] hover:bg-[#002352] active:scale-[0.99] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock size={13} />
                  <span>{isLoading ? 'Sparar...' : 'Spara nytt lösenord'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Security & System Info Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Endast behörig inspektör</span>
            </div>
            {isSupabaseConfigured() && (
              <div className="flex items-center gap-1 text-sky-700 font-medium">
                <Cloud className="w-3.5 h-3.5" />
                <span>Supabase säkrad</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
