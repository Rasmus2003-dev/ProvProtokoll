import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/ProvContext';
import { triggerHaptic } from '../lib/utils';
import { PrivacyGuard } from '../components/PrivacyGuard';
import { VtrStatusBadge } from '../components/VtrStatusBadge';
import { VtrDetailsPanel } from '../components/VtrDetailsPanel';
import { useToast } from '../components/Toast';
import { fetchElever, addElev, deleteElev, subscribeToElever } from '../lib/elevregister';
import { isSupabaseConfigured } from '../lib/supabase';
import type { ElevRecord } from '../types';

export type { ElevRecord };

export function ElevregisterScreen() {
  const navigate = useNavigate();
  const { resetCurrentTest } = useAppStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'trv' | 'trafikskola'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalSource, setModalSource] = useState<'trv' | 'trafikskola'>('trv');
  const [expandedVtrId, setExpandedVtrId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [personalNumber, setPersonalNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseType, setLicenseType] = useState('B');
  const [transmission, setTransmission] = useState<'Manuell' | 'Automat'>('Manuell');
  const [testType, setTestType] = useState('Förstaprov');
  const [bookingTime, setBookingTime] = useState('09:00');

  // Register State: Supabase (delat mellan enheter/inspektörer) med lokal fallback
  const [elever, setElever] = useState<ElevRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchElever().then((records) => {
      if (!cancelled) {
        setElever(records);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Live-uppdatera registret när andra inspektörer lägger till/tar bort elever
  useEffect(() => {
    const unsubscribe = subscribeToElever((records) => setElever(records));
    return unsubscribe;
  }, []);

  const handleAddElev = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !personalNumber.trim()) return;

    const newRecord: ElevRecord = {
      id: 'elev-' + Date.now(),
      source: modalSource,
      name: name.trim(),
      personalNumber: personalNumber.trim(),
      email: email.trim(),
      phone: phone.trim() || 'Ej angivet',
      licenseType,
      transmission,
      testType,
      bookingTime: modalSource === 'trv' ? bookingTime : undefined,
      status: modalSource === 'trv' ? 'Klar för start' : 'Aktiv elev',
      teacher: 'Rasmus Lundin',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setElever((prev) => [newRecord, ...prev]);

    // Reset Form
    setName('');
    setPersonalNumber('');
    setEmail('');
    setPhone('');
    setShowAddModal(false);
    triggerHaptic('success');

    const result = await addElev(newRecord);
    if (!result.success) {
      showToast(
        `Eleven är sparad lokalt, men molnsynk misslyckades (${result.error || 'okänt fel'}).`,
        'warning'
      );
    }
  };

  const handleDeleteElev = async (id: string) => {
    setElever((prev) => prev.filter(e => e.id !== id));
    triggerHaptic('light');

    const result = await deleteElev(id);
    if (!result.success) {
      showToast(
        `Borttagning sparades lokalt, men molnsynk misslyckades (${result.error || 'okänt fel'}).`,
        'warning'
      );
    }
  };

  const handleStartTestForElev = (elev: ElevRecord) => {
    resetCurrentTest({
      studentName: elev.name,
      personalNumber: elev.personalNumber,
      email: elev.email,
      licenseType: elev.licenseType,
      testType: elev.testType || 'Förstaprov',
      transmission: elev.transmission
    });
    triggerHaptic('medium');
    navigate('/korprov/start');
  };

  const filteredElever = elever.filter(elev => {
    const matchesTab = 
      activeTab === 'all' ? true : elev.source === activeTab;
    const cleanSearch = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !cleanSearch ||
      elev.name.toLowerCase().includes(cleanSearch) ||
      elev.personalNumber.includes(cleanSearch) ||
      elev.licenseType.toLowerCase().includes(cleanSearch) ||
      elev.email.toLowerCase().includes(cleanSearch);
    return matchesTab && matchesSearch;
  });

  const trvCount = elever.filter(e => e.source === 'trv').length;
  const skolaCount = elever.filter(e => e.source === 'trafikskola').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4 pb-24 font-sans text-gray-900 dark:text-gray-100">
      
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-[#002f6c] text-white dark:bg-blue-600 shadow-xs">
              <Users size={22} />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-[#002f6c] dark:text-blue-400">
              Centralt Elevregister
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Elev- & Kandidatregister
            </h1>
            {isSupabaseConfigured() && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Synkad live
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Gemensam hantering av provkandidater (körkortsprov TRV) och trafikelever (Trafikskolan).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setModalSource('trv');
              setShowAddModal(true);
            }}
            className="flex-1 md:flex-none px-4 py-3 bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Ny TRV Kandidat</span>
          </button>
          <button
            onClick={() => {
              setModalSource('trafikskola');
              setShowAddModal(true);
            }}
            className="flex-1 md:flex-none px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Ny Trafikelev</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto border border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-[#002f6c] dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            <span>Alla Elever</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-slate-700">
              {elever.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('trv')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'trv'
                ? 'bg-white dark:bg-slate-900 text-[#002f6c] dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            <Building2 size={14} className="text-blue-600" />
            <span>Körkortsprov (TRV)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-black">
              {trvCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('trafikskola')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'trafikskola'
                ? 'bg-white dark:bg-slate-900 text-[#002f6c] dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            <GraduationCap size={14} className="text-emerald-500" />
            <span>Trafikskola</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-black">
              {skolaCount}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sök namn, personnummer, behörighet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
          />
        </div>
      </div>

      {/* Elevregister Table / Cards */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-8 h-8 mx-auto border-[3px] border-gray-200 dark:border-white/10 border-t-[#002f6c] dark:border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : filteredElever.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400">
            <Users size={32} />
          </div>
          <h3 className="text-base font-black text-gray-900 dark:text-white">
            Inga registrerade elever
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Registret är rensat på testkandidater. Klicka på "Ny TRV Kandidat" eller "Ny Trafikelev" ovan för att registrera en elev.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredElever.map(elev => {
            const isTrv = elev.source === 'trv';
            return (
              <div 
                key={elev.id}
                className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
                      isTrv 
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-900'
                    }`}>
                      {isTrv ? <Building2 size={12} /> : <GraduationCap size={12} />}
                      {isTrv ? 'Körkortsprov' : 'Trafikskola'}
                    </span>
                    <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-[#002f6c] dark:text-blue-400">
                      {elev.licenseType}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-gray-900 dark:text-white mb-0.5">
                    {elev.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <PrivacyGuard className="inline-block">
                      <div className="text-xs font-mono text-gray-500 dark:text-slate-400">
                        {elev.personalNumber}
                      </div>
                    </PrivacyGuard>
                    <VtrStatusBadge personalNumber={elev.personalNumber} compact />
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-300 border-t border-gray-100 dark:border-slate-800 pt-3">
                    {elev.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-gray-400" />
                        <span>{elev.phone}</span>
                      </div>
                    )}
                    {elev.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate">{elev.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-gray-400">
                      <span>Växellåda: {elev.transmission}</span>
                      {elev.bookingTime && (
                        <span>Tid: {elev.bookingTime}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedVtrId(expandedVtrId === elev.id ? null : elev.id)}
                    className="w-full text-left text-[11px] font-bold text-[#002f6c] dark:text-blue-400 hover:underline pt-2 cursor-pointer"
                  >
                    {expandedVtrId === elev.id ? '▾ Dölj vägtrafikregister' : '▸ Visa vägtrafikregister'}
                  </button>
                  {expandedVtrId === elev.id && (
                    <div className="pt-2 pb-1 animate-in fade-in duration-150">
                      <VtrDetailsPanel personalNumber={elev.personalNumber} />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDeleteElev(elev.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    title="Ta bort elev"
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    onClick={() => handleStartTestForElev(elev)}
                    className="flex-1 px-3 py-2 bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Starta Prov</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Elev Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#002f6c] dark:text-blue-400">
                  <UserPlus size={18} />
                </span>
                <h3 className="font-black text-base text-gray-900 dark:text-white">
                  Registrera {modalSource === 'trv' ? 'Provkandidat (TRV)' : 'Trafikelev'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddElev} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                  Källa / Organisation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalSource('trv')}
                    className={`h-10 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalSource === 'trv'
                        ? 'bg-[#002f6c] text-white border-[#002f6c] dark:bg-blue-600'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <Building2 size={14} />
                    <span>Körkortsprov (TRV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalSource('trafikskola')}
                    className={`h-10 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalSource === 'trafikskola'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <GraduationCap size={14} />
                    <span>Trafikskola</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    För- och efternamn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="T.ex. Johan Nilsson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    Personnummer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ÅÅÅÅMMDD-XXXX"
                    value={personalNumber}
                    onChange={(e) => setPersonalNumber(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    E-postadress
                  </label>
                  <input
                    type="email"
                    placeholder="elev@exempel.se"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    Telefonnummer
                  </label>
                  <input
                    type="tel"
                    placeholder="070-123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    Behörighet
                  </label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none dark:text-white cursor-pointer"
                  >
                    <option value="B">B - Personbil</option>
                    <option value="B1">B1 - Fyrhjuling & Lätt bil</option>
                    <option value="BE">BE - Personbil med släp</option>
                    <option value="B96">B96 - Utökad B</option>
                    <option value="C">C - Tung lastbil</option>
                    <option value="CE">CE - Tungt släp</option>
                    <option value="D">D - Buss</option>
                    <option value="A">A - Tung motorcykel</option>
                    <option value="AM">AM - Moped klass I</option>
                    <option value="TAXI">TAXI - Taxiförarprov</option>
                    <option value="Traktor (Traktorkort)">Traktor (Traktorkort)</option>
                    <option value="Snöskoter (Förarbevis)">Snöskoter</option>
                    <option value="Terränghjuling (ATV)">Terränghjuling (ATV)</option>
                    <option value="Truck (A+B)">Truck (A+B)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    Växellåda
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                    className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none dark:text-white cursor-pointer"
                  >
                    <option value="Manuell">⚙️ Manuell</option>
                    <option value="Automat">⚡ Automat (78)</option>
                  </select>
                </div>
              </div>

              {modalSource === 'trv' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                      Provtyp
                    </label>
                    <select
                      value={testType}
                      onChange={(e) => setTestType(e.target.value)}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none dark:text-white cursor-pointer"
                    >
                      <option value="Förstaprov">Förstaprov</option>
                      <option value="Omprov">Omprov</option>
                      <option value="Omprov säkerhetskontroll">Omprov säkerhetskontroll</option>
                      <option value="Omprov körning">Omprov körning</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                      Starttid
                    </label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-black uppercase tracking-wider text-white bg-[#002f6c] dark:bg-blue-600 hover:bg-[#00204a] rounded-xl cursor-pointer shadow-sm"
                >
                  Spara Elev
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
