import React, { useState } from 'react';
import { useAppStore } from '../store/ProvContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Shield, Mail, Phone, MapPin, FileSignature, 
  CheckCircle2, Cloud, Database, ArrowLeft, LogOut, 
  Award, Edit3, Save, X, Sparkles, Key
} from 'lucide-react';
import { AppLogo } from '../components/icons/AppLogo';
import { isSupabaseConfigured, signOutSupabase, updateUserPassword } from '../lib/supabase';

export function ProfilScreen() {
  const { profile, updateProfile, syncQueue, testHistory, syncTests, isSyncing } = useAppStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [inspectorId, setInspectorId] = useState(profile.inspectorId);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [depot, setDepot] = useState(profile.depot);
  const [signatureText, setSignatureText] = useState(profile.signatureText);
  const [autoSign, setAutoSign] = useState(profile.autoSign);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile.vehicleCategories || []);
  
  const [showNotification, setShowNotification] = useState(false);

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSave = () => {
    updateProfile(() => ({
      name,
      inspectorId,
      email,
      phone,
      depot,
      signatureText,
      vehicleCategories: selectedCategories,
      autoSign
    }));
    setIsEditing(false);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false), 3000;
    }, 3000);
  };

  const handleCancel = () => {
    setName(profile.name);
    setInspectorId(profile.inspectorId);
    setEmail(profile.email);
    setPhone(profile.phone);
    setDepot(profile.depot);
    setSignatureText(profile.signatureText);
    setAutoSign(profile.autoSign);
    setSelectedCategories(profile.vehicleCategories || []);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Är du säker på att du vill logga ut från provsystemet?')) {
      await signOutSupabase();
      localStorage.removeItem('provprotokoll-is-logged-in');
      window.location.reload();
    }
  };

  const availableCategories = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'TAXI'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8 font-sans antialiased text-gray-900 dark:text-gray-100">
      
      {/* Top Header with Back Button & Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/korprov')}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Tillbaka till prov"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#002f6c] dark:text-blue-400">
                Auktoriserad Profil
              </span>
              {isSupabaseConfigured() && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Cloud size={10} /> Supabase Online
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white uppercase">
              Min Inspektörsprofil
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-[#002f6c] hover:bg-[#00204a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Redigera profil</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCancel}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Avbryt
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>Spara ändringar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showNotification && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-emerald-900 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profilen och signaturinställningarna har sparats och synkroniserats!</span>
          </div>
          <button onClick={() => setShowNotification(false)} className="text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase hover:underline">
            Stäng
          </button>
        </div>
      )}

      {/* Main Grid: Visual Identity Card (Left) + Form Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Modern Inspector ID Badge & Status */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Identity Card with App Logo */}
          <div className="bg-gradient-to-br from-[#002f6c] via-[#001f3f] to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge Top Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2.5">
                <AppLogo variant="icon" size="sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                  Trafikverket Förarprov
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            </div>

            {/* Inspector Avatar & Name */}
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                {profile.name ? profile.name[0].toUpperCase() : 'R'}
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black text-white truncate">{profile.name}</div>
                <div className="text-xs font-mono text-blue-300 font-bold tracking-wider">{profile.inspectorId}</div>
                <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-sky-300" />
                  <span>{profile.depot}</span>
                </div>
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 relative z-10 text-center">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Körprov Idag</span>
                <span className="text-lg font-black text-white">4 Prov</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Protokoll i Kö</span>
                <span className="text-lg font-black text-sky-300">{syncQueue.length} st</span>
              </div>
            </div>

            {/* Digital Signature Preview */}
            <div className="mt-5 p-3.5 bg-black/30 rounded-2xl border border-white/5 relative z-10">
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Aktiv protokollsignatur:
              </span>
              <p className="font-mono text-xs text-amber-300 font-bold tracking-wide truncate">
                {profile.signatureText || `${profile.name} / ProvProtokoll`}
              </p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200/80 dark:border-white/5 shadow-sm space-y-3">
            <button
              onClick={() => navigate('/historik')}
              className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors flex items-center justify-between cursor-pointer border border-gray-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-2">
                <Database size={15} className="text-blue-600 dark:text-blue-400" />
                <span>Arkiv & Historik</span>
              </div>
              <span className="text-[11px] font-mono text-gray-400 font-bold">{testHistory.length} sparade</span>
            </button>

            {syncQueue.length > 0 && (
              <button
                onClick={syncTests}
                disabled={isSyncing}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Cloud size={15} />
                <span>{isSyncing ? 'Synkroniserar...' : 'Synka osynkade prov'}</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-200/80 dark:border-red-900/30"
            >
              <LogOut size={15} />
              <span>Logga ut från terminalen</span>
            </button>
          </div>

        </div>

        {/* Right Column: Settings & Authorizations (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-white/5 shadow-sm space-y-8">
          
          {/* Section 1: Personal Details */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-white/5">
              <User size={16} className="text-[#002f6c] dark:text-blue-400" />
              Grunduppgifter
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                  Fullständigt namn
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                    required
                  />
                ) : (
                  <div className="h-11 px-3.5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    {profile.name}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                  Inspektörs-ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={inspectorId}
                    onChange={(e) => setInspectorId(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                    required
                  />
                ) : (
                  <div className="h-11 px-3.5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-xl text-sm font-mono font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    {profile.inspectorId}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                  Tjänste-e-post
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                    required
                  />
                ) : (
                  <div className="h-11 px-3.5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    {profile.email}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                  Tjänstetelefon
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                  />
                ) : (
                  <div className="h-11 px-3.5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    {profile.phone || '–'}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                  Stationering / Förarprovskontor
                </label>
                {isEditing ? (
                  <select
                    value={depot}
                    onChange={(e) => setDepot(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                  >
                    <option value="Samtliga orter / Hela Sverige">Samtliga orter / Hela Sverige</option>
                    <option value="Göteborg Hisingen">Göteborg Hisingen</option>
                    <option value="Stockholm Sollentuna">Stockholm Sollentuna</option>
                    <option value="Stockholm Farsta">Stockholm Farsta</option>
                    <option value="Malmö">Malmö</option>
                    <option value="Umeå">Umeå</option>
                    <option value="Örebro">Örebro</option>
                    <option value="Jönköping">Jönköping</option>
                  </select>
                ) : (
                  <div className="h-11 px-3.5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    {profile.depot}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Signature Settings */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-white/5">
              <FileSignature size={16} className="text-[#002f6c] dark:text-blue-400" />
              Digital Protokollsignatur
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 items-end">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                  Signaturtext på utskrift & PDF
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                    required
                  />
                ) : (
                  <div className="h-11 px-3.5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-xl text-sm font-mono font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    {profile.signatureText}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                {isEditing ? (
                  <label className="flex items-center gap-2.5 h-11 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSign}
                      onChange={(e) => setAutoSign(e.target.checked)}
                      className="w-5 h-5 rounded-md accent-[#002f6c]"
                    />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      Automatisk signatur
                    </span>
                  </label>
                ) : (
                  <div className="h-11 px-3.5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center">
                    Status: {profile.autoSign ? 'Aktiv' : 'Manuell'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Authorized Vehicle Categories */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                <Award size={16} className="text-[#002f6c] dark:text-blue-400" />
                Certifierade Behörigheter
              </h2>
              <span className="text-xs text-gray-400 font-medium">
                {selectedCategories.length} behörigheter aktiverade
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 mb-4">
              Klicka på respektive behörighet under redigeringsläge för att ändra vilka fordonsslag du är behörig att pröva.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => handleCategoryToggle(cat)}
                    className={`py-3 px-4 rounded-xl font-black text-sm tracking-wider transition-all select-none flex items-center justify-center border ${
                      isSelected
                        ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-transparent shadow-sm'
                        : 'bg-gray-50 dark:bg-slate-800/60 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-800'
                    } ${isEditing ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Security & Change Password */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                <Key size={16} className="text-[#002f6c] dark:text-blue-400" />
                Säkerhet & Lösenord
              </h2>
            </div>

            <div className="mt-5 p-5 bg-gray-50/70 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-800 rounded-2xl max-w-xl space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Här kan du när som helst uppdatera ditt personliga inloggningslösenord för inspektörskontot.
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const newP = target.newPass.value.trim();
                  const confP = target.confPass.value.trim();
                  if (newP.length < 4) {
                    alert('Lösenordet måste bestå av minst 4 tecken.');
                    return;
                  }
                  if (newP !== confP) {
                    alert('Lösenorden matchar inte varandra.');
                    return;
                  }
                  localStorage.setItem('provprotokoll-rasmus-password', newP);
                  updateUserPassword(newP).catch(console.warn);
                  alert('Lösenordet har uppdaterats framgångsrikt!');
                  target.reset();
                }}
                className="space-y-3 pt-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                      Nytt lösenord
                    </label>
                    <input 
                      name="newPass"
                      type="password"
                      placeholder="Minst 4 tecken"
                      className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#002f6c] dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                      Bekräfta lösenord
                    </label>
                    <input 
                      name="confPass"
                      type="password"
                      placeholder="Upprepa lösenord"
                      className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#002f6c] dark:text-white"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002f6c] hover:bg-[#00204a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Uppdatera lösenord
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
