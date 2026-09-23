import React, { useEffect, useRef, useState } from 'react';
import { AppLogo } from '../components/icons/AppLogo';
import { useAppStore } from '../store/ProvContext';
import {
  ShieldAlert, KeyRound, User, AlertCircle, CheckCircle2, Lock, Eye, EyeOff,
  WifiOff, Wifi, Loader2, Check, X,
} from 'lucide-react';
import { attemptLogin, changePassword, ensureSuperAdminExists } from '../lib/inspectors';
import { MIN_PASSWORD_LENGTH } from '../lib/authConfig';
import type { Inspector } from '../types';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const REMEMBER_KEY = 'provprotokoll-remembered-username';

function readRememberedUsername(): string {
  try { return localStorage.getItem(REMEMBER_KEY) || ''; } catch (_) { return ''; }
}

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

// --- Fält ---

// Övriga props (value, onChange, autoComplete ...) skickas vidare till <input>
interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  hint?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  [inputProp: string]: any;
}

function Field({ label, icon, trailing, hint, id, inputRef, ...input }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 block">{label}</label>
      <div className="relative group">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#002f6c] dark:group-focus-within:text-blue-400 transition-colors pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          ref={inputRef}
          {...input}
          className="w-full h-11 pl-10 pr-11 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#002f6c]/15 dark:focus:ring-blue-500/25 transition-colors"
        />
        {trailing && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>}
      </div>
      {hint}
    </div>
  );
}

function PasswordField(props: { id: string; label: string; [inputProp: string]: any }) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.('CapsLock') ?? false);
  return (
    <Field
      {...props}
      type={visible ? 'text' : 'password'}
      icon={<KeyRound size={18} />}
      onKeyUp={checkCaps}
      onKeyDown={checkCaps}
      onBlur={() => setCapsLock(false)}
      trailing={
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label={visible ? 'Dölj lösenord' : 'Visa lösenord'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
      hint={capsLock ? (
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <AlertCircle size={13} /> Caps Lock är på
        </p>
      ) : undefined}
    />
  );
}

function Alert({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const styles = tone === 'error'
    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200'
    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200';
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`p-3.5 border rounded-xl text-sm font-medium flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 ${styles}`}>
      {tone === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
      <span>{children}</span>
    </div>
  );
}

function SubmitButton({ loading, done, label, loadingLabel, doneLabel }: { loading: boolean; done: boolean; label: string; loadingLabel: string; doneLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading || done}
      className={`w-full h-11 rounded-md text-white font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-default ${
        done
          ? 'bg-emerald-700'
          : 'bg-[#002f6c] hover:bg-[#00245a] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-80'
      }`}
    >
      {done ? <><Check size={17} strokeWidth={3} /> {doneLabel}</>
        : loading ? <><Loader2 size={17} className="animate-spin" /> {loadingLabel}</>
        : label}
    </button>
  );
}

// Enkel styrkemätare för nytt lösenord
function passwordChecks(pw: string) {
  return [
    { label: `Minst ${MIN_PASSWORD_LENGTH} tecken`, ok: pw.length >= MIN_PASSWORD_LENGTH },
    { label: 'Stor och liten bokstav', ok: /[a-zåäö]/.test(pw) && /[A-ZÅÄÖ]/.test(pw) },
    { label: 'Minst en siffra', ok: /\d/.test(pw) },
  ];
}

// --- Skärmen ---

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { updateProfile } = useAppStore();
  const online = useOnline();

  const [username, setUsername] = useState(readRememberedUsername);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => readRememberedUsername() !== '');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [shakeKey, setShakeKey] = useState(0);
  const passwordRef = useRef<HTMLInputElement | null>(null);

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

  // Om användarnamnet är ihågkommet – börja direkt i lösenordsfältet
  useEffect(() => {
    if (!isBootstrapping && username) passwordRef.current?.focus();
  }, [isBootstrapping]); // eslint-disable-line react-hooks/exhaustive-deps

  const fail = (message: string) => {
    setError(message);
    setShakeKey(k => k + 1);
  };

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

    if (!trimmedUser) return fail('Ange användarnamn.');
    if (!trimmedPass) return fail('Ange lösenord.');

    setIsLoading(true);
    const result = await attemptLogin(trimmedUser, trimmedPass);
    setIsLoading(false);

    if (!result.success || !result.inspector) {
      setPassword('');
      passwordRef.current?.focus();
      return fail(result.error || 'Inloggning misslyckades.');
    }

    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, trimmedUser);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch (_) {}

    if (result.mustChangePassword) {
      // Blockera vidare åtkomst tills lösenordet bytts - visa bytesvyn
      // istället för att släppa in i appen.
      setForcedChangeInspector(result.inspector);
      setSuccessMsg('');
      return;
    }

    applyInspectorProfile(result.inspector);
    setSuccessMsg(`Välkommen ${result.inspector.name.split(' ')[0]}!`);
    setTimeout(() => onLoginSuccess(), 600);
  };

  const handleForcedChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!forcedChangeInspector) return;

    if (newPassword.length < MIN_PASSWORD_LENGTH) return fail(`Det nya lösenordet måste innehålla minst ${MIN_PASSWORD_LENGTH} tecken.`);
    if (newPassword !== confirmPassword) return fail('De nya lösenorden matchar inte varandra.');

    setIsLoading(true);
    const result = await changePassword(forcedChangeInspector.id, newPassword);
    setIsLoading(false);

    if (!result.success) return fail(result.error || 'Kunde inte byta lösenord.');

    applyInspectorProfile({ ...forcedChangeInspector, mustChangePassword: false });
    setSuccessMsg('Lösenordet är bytt. Loggar in...');
    setTimeout(() => onLoginSuccess(), 600);
  };

  const checks = passwordChecks(newPassword);
  const strength = checks.filter(c => c.ok).length;
  const strengthLabel = ['Svagt', 'Svagt', 'Okej', 'Starkt'][strength];
  const strengthColor = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'][strength];
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 dark:bg-slate-950 overflow-y-auto animate-in fade-in duration-200">
      <div className="h-1 bg-[#002f6c] dark:bg-blue-600 shrink-0" />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            {/* Huvud */}
            <div className="px-7 sm:px-8 pt-7 pb-5 border-b border-slate-200 dark:border-slate-800 text-center">
              <div className="flex justify-center mb-4">
                <AppLogo variant="provprotokoll" size="md" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {forcedChangeInspector ? 'Byt lösenord' : 'Inspektörsinloggning'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Endast för behörig personal</p>
            </div>

            <div className="px-7 sm:px-8 py-6">
            {isBootstrapping ? (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
                <Loader2 size={28} className="animate-spin text-[#002f6c] dark:text-blue-400" />
                <span className="text-sm font-medium">Förbereder inloggning...</span>
              </div>
            ) : forcedChangeInspector ? (
              /* --- Tvingat lösenordsbyte --- */
              <div key={shakeKey} className={shakeKey ? 'animate-login-shake' : ''}>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 flex gap-2">
                  <Lock size={15} className="shrink-0 mt-0.5 text-slate-400" />
                  <span>{forcedChangeInspector.name}: av säkerhetsskäl måste du välja ett eget lösenord innan du fortsätter.</span>
                </p>

                <form onSubmit={handleForcedChangeSubmit} className="space-y-4">
                  {error && <Alert tone="error">{error}</Alert>}
                  {successMsg && <Alert tone="success">{successMsg}</Alert>}

                  <input type="text" name="username" autoComplete="username" value={forcedChangeInspector.username} readOnly hidden />
                  <PasswordField
                    id="new-password"
                    label="Nytt lösenord"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Välj ett lösenord"
                    autoComplete="new-password"
                    autoFocus
                    required
                  />

                  {newPassword && (
                    <div className="space-y-2 -mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-3 gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-colors ${i < strength ? strengthColor : 'bg-slate-200 dark:bg-slate-800'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-500 w-12 text-right">{strengthLabel}</span>
                      </div>
                      <ul className="grid gap-1">
                        {checks.map(c => (
                          <li key={c.label} className={`text-xs flex items-center gap-1.5 ${c.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {c.ok ? <Check size={13} strokeWidth={3} /> : <X size={13} />} {c.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <PasswordField
                    id="confirm-password"
                    label="Bekräfta lösenord"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Upprepa lösenordet"
                    autoComplete="new-password"
                    required
                  />
                  {confirmMismatch && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 -mt-2">Lösenorden matchar inte.</p>
                  )}

                  <div className="pt-2">
                    <SubmitButton loading={isLoading} done={Boolean(successMsg)} label="Spara och logga in" loadingLabel="Sparar..." doneLabel="Klart" />
                  </div>
                </form>
              </div>
            ) : (
              /* --- Inloggning --- */
              <div key={shakeKey} className={shakeKey ? 'animate-login-shake' : ''}>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && <Alert tone="error">{error}</Alert>}
                  {successMsg && <Alert tone="success">{successMsg}</Alert>}

                  <Field
                    id="login-username"
                    name="username"
                    label="Användarnamn"
                    icon={<User size={18} />}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="t.ex. rasmus.lundin"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus={!username}
                    required
                  />

                  <PasswordField
                    id="login-password"
                    name="password"
                    label="Lösenord"
                    inputRef={passwordRef}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ditt lösenord"
                    autoComplete="current-password"
                    required
                  />

                  <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 accent-[#002f6c] cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Kom ihåg mitt användarnamn</span>
                  </label>

                  <div className="pt-2">
                    <SubmitButton loading={isLoading} done={Boolean(successMsg)} label="Logga in" loadingLabel="Loggar in..." doneLabel="Inloggad" />
                  </div>
                </form>

                <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 text-center">
                  Glömt lösenordet? Kontakta en administratör.
                </p>
              </div>
            )}
            </div>

            {/* Varning om obehörig åtkomst */}
            <div className="px-7 sm:px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-b-lg flex gap-3">
              <ShieldAlert size={18} className="shrink-0 mt-0.5 text-[#002f6c] dark:text-blue-400" />
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200">Endast behöriga användare.</strong>{' '}
                Systemet innehåller personuppgifter. Obehörig åtkomst eller användning kan leda till disciplinära och rättsliga åtgärder. Inloggningar registreras.
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <span className={`flex items-center gap-1.5 ${online ? '' : 'text-amber-600 dark:text-amber-400 font-semibold'}`}>
              {online ? <Wifi size={12} /> : <WifiOff size={12} />}
              {online ? 'Ansluten' : 'Offline – inloggning kräver anslutning'}
            </span>
            <span>© {new Date().getFullYear()} ProvProtokoll</span>
          </div>
        </div>
      </main>
    </div>
  );
}
