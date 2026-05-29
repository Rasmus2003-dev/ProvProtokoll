import { useState } from 'react';
import { useAppStore } from '../store/ProvContext';
import { useNavigate } from 'react-router-dom';

export function ProfilScreen() {
  const { profile, updateProfile, syncQueue, syncTests, isSyncing } = useAppStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [inspectorId, setInspectorId] = useState(profile.inspectorId);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [depot, setDepot] = useState(profile.depot);
  const [signatureText, setSignatureText] = useState(profile.signatureText);
  const [autoSign, setAutoSign] = useState(profile.autoSign);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile.vehicleCategories);
  
  const [showNotification, setShowNotification] = useState(false);

  // Tablet-friendly toggle helper
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
      setShowNotification(false);
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
    setSelectedCategories(profile.vehicleCategories);
    setIsEditing(false);
  };

  // Mock statistics for a professional look on tablets
  const stats = {
    todayCount: 4,
    monthCount: 68,
    approvalRate: "72%",
    lastSync: "Idag, 08:45"
  };

  const availableCategories = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'TAXI'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 space-y-8 font-sans">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Körprovssystem</span>
          <h1 className="text-3xl md:text-4xl font-display font-black text-gray-950 mt-1 uppercase tracking-tight">Min Profil</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Hantera dina inspektörsuppgifter, behörigheter och digitala signaturer.
          </p>
        </div>
        <div>
          <button 
            onClick={() => navigate('/korprov')}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold uppercase tracking-wider transition-all duration-150 rounded-none cursor-pointer"
          >
            Tillbaka till Prov
          </button>
        </div>
      </div>

      {showNotification && (
        <div className="p-4 bg-emerald-50 border-l-[3px] border-emerald-600 text-emerald-950 text-sm font-semibold flex items-center justify-between">
          <span>Profilen är uppdaterad och sparad i det lokala förarprovssystemet.</span>
          <button onClick={() => setShowNotification(false)} className="text-emerald-700 font-bold text-xs uppercase hover:underline">Stäng</button>
        </div>
      )}

      {/* Main split grid layout – Perfect on tablets (e.g. iPad Pro/Air) in landscape or portrait split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-gray-200 bg-white p-6 md:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DD1D25]">Systemstatus</span>
              <h2 className="text-xl font-display font-bold text-gray-950 uppercase tracking-tight mt-0.5">Din Dienst</h2>
            </div>

            {/* Live profile info badge */}
            <div className="space-y-1">
              <div className="text-2xl font-black text-gray-900 leading-none">{profile.name}</div>
              <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">{profile.inspectorId}</div>
              <div className="text-sm text-gray-500 pt-1">{profile.depot}</div>
            </div>

            {/* Quick stats items */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 p-4 border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Prov idag</span>
                <span className="text-2xl font-black text-gray-950 mt-1 block">{stats.todayCount}</span>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Denna månad</span>
                <span className="text-2xl font-black text-gray-950 mt-1 block">{stats.monthCount}</span>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-200 col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Godkännandegrad</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">{stats.approvalRate}</span>
              </div>
            </div>

            {/* Database sync parameters */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 uppercase font-medium">Osynkade prov i kö:</span>
                <span className={`font-bold ${syncQueue.length > 0 ? 'text-[#DD1D25]' : 'text-gray-400'}`}>
                  {syncQueue.length} st
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 uppercase font-medium">Senaste synkning:</span>
                <span className="text-gray-700 font-bold">{stats.lastSync}</span>
              </div>
              
              {syncQueue.length > 0 && (
                <button
                  type="button"
                  onClick={syncTests}
                  disabled={isSyncing}
                  className="w-full mt-2 py-2.5 bg-gray-900 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-black disabled:bg-gray-300 transition-colors"
                >
                  {isSyncing ? 'SYNKRONISERAR...' : 'SYNKRONISERA KÖN NU'}
                </button>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('provprotokoll-is-logged-in');
                    window.location.reload();
                  }}
                  className="w-full py-2.5 bg-white border border-[#c40000] text-[#c40000] hover:bg-[#fce8e6] dark:bg-slate-950 dark:hover:bg-red-950/20 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  LOGGA UT FRÅN SYSTEMET
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Main Configuration Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 bg-white p-6 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Inställningar</span>
                <h2 className="text-xl font-display font-bold text-gray-950 uppercase tracking-tight mt-0.5">Inspektörsuppgifter</h2>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-black uppercase"
                >
                  Modifiera profil
                </button>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              
              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Fullständigt namn</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium"
                      required
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800">
                      {profile.name}
                    </div>
                  )}
                </div>

                {/* Inspector ID */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Inspektörsnummer (ID)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={inspectorId}
                      onChange={(e) => setInspectorId(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium"
                      required
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800">
                      {profile.inspectorId}
                    </div>
                  )}
                </div>

                {/* Email address */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Intern e-postadress</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium"
                      required
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800">
                      {profile.email}
                    </div>
                  )}
                </div>

                {/* Phone number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Tjänstetelefonnummer</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium"
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800">
                      {profile.phone || '-'}
                    </div>
                  )}
                </div>

                {/* Region / Depot */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Stationering (Depå/Förarprovskontor)</label>
                  {isEditing ? (
                    <select
                      value={depot}
                      onChange={(e) => setDepot(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium"
                    >
                      <option value="Göteborg Hisingen">Göteborg Hisingen</option>
                      <option value="Stockholm Sollentuna">Stockholm Sollentuna</option>
                      <option value="Stockholm Farsta">Stockholm Farsta</option>
                      <option value="Malmö">Malmö</option>
                      <option value="Umeå">Umeå</option>
                      <option value="Örebro">Örebro</option>
                      <option value="Jönköping">Jönköping</option>
                    </select>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800">
                      {profile.depot}
                    </div>
                  )}
                </div>

              </div>

              {/* Digital Signature Segment */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Digital Protokollsignatur</label>
                  <p className="text-xs text-gray-400 mt-0.5">Den text som infogas på det slutgiltiga PDF/utskriftsprotokollet vid godkänt beslut.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Signaturstext</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-semibold font-mono"
                        required
                      />
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-bold font-mono text-gray-800">
                        {profile.signatureText}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center pt-2 md:pt-6">
                    {isEditing ? (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoSign}
                          onChange={(e) => setAutoSign(e.target.checked)}
                          className="w-4 h-4 accent-[#DD1D25]"
                        />
                        <span className="text-xs font-bold text-gray-700 uppercase">Automatisk signatur</span>
                      </label>
                    ) : (
                      <div className="text-xs font-extrabold uppercase text-gray-400">
                        Signatur: {profile.autoSign ? 'AUTOMATISK' : 'MANUELL'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Authorized categories table/matrix - PERFECT ON TABLETS with large touch triggers */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Auktoriserade Körkortsbehörigheter</label>
                  <p className="text-xs text-gray-400 mt-0.5">Markera de behörigheter som du är certifierad att förarpröva.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {availableCategories.map(cat => {
                    const isSelected = isEditing 
                      ? selectedCategories.includes(cat)
                      : profile.vehicleCategories.includes(cat);
                    
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={!isEditing}
                        onClick={() => handleCategoryToggle(cat)}
                        className={`py-3 px-4 text-center border text-sm font-bold transition-all select-none rounded-none focus:outline-none ${
                          isSelected 
                            ? 'bg-[#DD1D25] border-[#DD1D25] text-white' 
                            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 disabled:hover:bg-white'
                        } ${!isEditing ? 'opacity-80' : 'cursor-pointer'}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save / Cancel buttons block */}
              {isEditing && (
                <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-4 justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs uppercase tracking-widest transition-colors rounded-none cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-2.5 bg-[#DD1D25] text-white hover:bg-[#b01b1a] font-bold text-xs uppercase tracking-widest transition-colors rounded-none cursor-pointer"
                  >
                    Spara ändringar
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
