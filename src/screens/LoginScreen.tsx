import React, { useEffect, useState } from 'react';
import { AppLogo } from '../components/icons/AppLogo';
import { useAppStore } from '../store/ProvContext';
import { ShieldCheck, LogIn, KeyRound, Cloud, UserCheck, AlertCircle, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { attemptLogin, changePassword, ensureSuperAdminExists } from '../lib/inspectors';
import type { Inspector } from '../types';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { updateProfile } = useAppStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Tvingat lösenordsbyte: sätts när en inspektör loggar in med
  // must_change_password=true (första inloggningen, eller efter att en admin
  // återställt lösenordet). Kan inte avbrytas - man måste byta för att
  // komma vidare in i appen.
  const [forcedChangeInspector, setForcedChangeInspector] = useState<Inspector | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    ensureSuperAdminExists().finally(() => setIsBootstrapping(false));
  }, []);

  const applyInspectorProfile = (inspector: Inspector) => {
    updateProfile({
      name: inspector.name,
      inspectorId: inspector.id,
      email: inspector.email,
      depot: inspector.depots.join(', ') || 'Ej tilldelat kontor',
      vehicleCategories: inspector.vehicleCategories,
      role: inspector.role,
    });
    localStorage.setItem('provprotokoll-is-logged-in', 'true');
    localStorage.setItem('provprotokoll-logged-in-inspector-id', inspector.id);
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
    const result = await attemptLogin(trimmedUser, trimmedPass);
    setIsLoading(false);

    if (!result.success || !result.inspector) {
      setError(result.error || 'Inloggning misslyckades.');
      return;
    }

    if (result.mustChangePassword) {
      // Blockera vidare åtkomst tills lösenordet bytts - visa bytesvyn
      // istället för att släppa in i appen.
      setForcedChangeInspector(result.inspector);
      setSuccessMsg('');
      return;
    }

    applyInspectorProfile(result.inspector);
    setSuccessMsg(`Inloggning godkänd! Välkommen ${result.inspector.name}.`);
    setTimeout(() => onLoginSuccess(), 400);
  };

  const handleForcedChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!forcedChangeInspector) return;

    if (newPassword.length < 4) {
      setError('Det nya lösenordet måste innehålla minst 4 tecken.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('De nya lösenorden matchar inte varandra.');
      return;
    }
    if (newPassword === '1234') {
      setError('Välj ett annat lösenord än standardlösenordet 1234.');
      return;
    }

    setIsLoading(true);
    const result = await changePassword(forcedChangeInspector.id, newPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Kunde inte byta lösenord.');
      return;
    }

    applyInspectorProfile({ ...forcedChangeInspector, mustChangePassword: false });
    setSuccessMsg('Lösenordet är bytt. Loggar in...');
    setTimeout(() => onLoginSuccess(), 500);
  };

  if (isBootstrapping) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-md">
        <div className="w-8 h-8 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // --- Tvingat lösenordsbyte-vy: visas istället för allt annat tills bytt ---
  if (forcedChangeInspector) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
          <div className="pt-7 pb-5 px-6 sm:px-8 text-center bg-gradient-to-b from-amber-50/90 to-white border-b border-gray-100">
            <div className="flex justify-center mb-3">
              <AppLogo variant="provprotokoll" size="md" />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Byt lösenord för att fortsätta</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Välkommen {forcedChangeInspector.name}! Av säkerhetsskäl måste du välja ett eget lösenord innan du kan använda systemet.
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-start gap-2.5 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleForcedChangeSubmit} className="space-y-3.5" autoComplete="off">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Nytt lösenord</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minst 4 tecken"
                  autoComplete="new-password"
                  className="w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-[#002f6c] transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Bekräfta nytt lösenord</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Upprepa det nya lösenordet"
                  autoComplete="new-password"
                  className="w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-[#002f6c] transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#002f6c] hover:bg-[#002352] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-950/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <Lock size={16} />
                <span>{isLoading ? 'Sparar...' : 'Byt lösenord och logga in'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4 animate-in fade-in duration-200">

      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        <div className="pt-7 pb-5 px-6 sm:px-8 text-center bg-gradient-to-b from-slate-50/90 to-white border-b border-gray-100">
          <div className="flex justify-center mb-3">
            <AppLogo variant="provprotokoll" size="md" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Inspektörsinloggning</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Logga in med ditt personliga inspektörskonto
          </p>
        </div>

        <div className="p-6 sm:p-7 space-y-4">

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Användarnamn</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Lösenord</label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#002f6c] hover:bg-[#002352] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-950/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <LogIn size={16} />
              <span>{isLoading ? 'Verifierar behörighet...' : 'Logga in'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personligt inspektörskonto krävs</span>
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
