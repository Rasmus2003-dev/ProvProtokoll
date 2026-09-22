import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/ProvContext';
import { useToast } from '../components/Toast';
import {
  Users, Plus, ShieldCheck, Trash2, KeyRound, Power, X, UserPlus
} from 'lucide-react';
import { fetchAllInspectors, createInspector, deleteInspector, setInspectorActive } from '../lib/inspectors';
import type { Inspector } from '../types';

const VEHICLE_CATEGORIES = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'TAXI'];
const DEPOTS = ['Trollhättan', 'Göteborg', 'Stockholm', 'Malmö', 'Uppsala', 'Örebro', 'Linköping', 'Umeå'];

export function InspektorerScreen() {
  const { profile } = useAppStore();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'inspector'>('inspector');
  const [selectedDepots, setSelectedDepots] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tempPassword, setTempPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = profile.role === 'admin' || profile.inspectorId === 'insp-rasmus';

  const load = async () => {
    setLoading(true);
    const data = await fetchAllInspectors();
    setInspectors(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  // Endast admins får se denna vy. Standard-inspektörer skickas tillbaka.
  useEffect(() => {
    if (!isAdmin) {
      navigate('/korprov/start', { replace: true });
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const resetForm = () => {
    setUsername('');
    setName('');
    setEmail('');
    setRole('inspector');
    setSelectedDepots([]);
    setSelectedCategories([]);
    setTempPassword('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim() || !tempPassword.trim()) return;

    setSubmitting(true);
    const result = await createInspector({
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      role,
      depots: selectedDepots,
      vehicleCategories: selectedCategories,
      temporaryPassword: tempPassword.trim(),
    });
    setSubmitting(false);

    if (!result.success) {
      showToast(result.error || 'Kunde inte skapa inspektören.', 'error');
      return;
    }

    showToast(`Inspektör ${name.trim()} skapad. Tillfälligt lösenord måste bytas vid första inloggning.`, 'success');
    resetForm();
    setShowAddModal(false);
    load();
  };

  const handleDeactivate = async (inspector: Inspector) => {
    if (inspector.id === 'insp-rasmus') {
      showToast('Superadmin-kontot kan inte inaktiveras.', 'warning');
      return;
    }
    await setInspectorActive(inspector.id, !inspector.active);
    load();
  };

  const handleDelete = async (inspector: Inspector) => {
    if (inspector.id === 'insp-rasmus') {
      showToast('Superadmin-kontot kan inte tas bort.', 'warning');
      return;
    }
    if (!window.confirm(`Vill du verkligen ta bort inspektören ${inspector.name}?`)) return;
    await deleteInspector(inspector.id);
    showToast('Inspektör borttagen.', 'success');
    load();
  };

  const toggleDepot = (depot: string) => {
    setSelectedDepots((prev) => prev.includes(depot) ? prev.filter(d => d !== depot) : [...prev, depot]);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-4 pb-24 font-sans text-gray-900 dark:text-gray-100">

      <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-[#002f6c] text-white dark:bg-blue-600 shadow-xs">
              <Users size={22} />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-[#002f6c] dark:text-blue-400">
              Administratörsvy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Inspektörer
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Skapa och hantera inspektörskonton, kontorstillhörighet och fordonsbehörigheter.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-3 bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Ny inspektör</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-8 h-8 mx-auto border-[3px] border-gray-200 dark:border-white/10 border-t-[#002f6c] dark:border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inspectors.map((inspector) => (
            <div
              key={inspector.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between ${
                inspector.active ? 'border-gray-200/80 dark:border-slate-800' : 'border-red-200 dark:border-red-900/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
                    inspector.role === 'admin'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900'
                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900'
                  }`}>
                    <ShieldCheck size={12} />
                    {inspector.role === 'admin' ? 'Administratör' : 'Inspektör'}
                  </span>
                  {!inspector.active && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      Inaktiverad
                    </span>
                  )}
                  {inspector.mustChangePassword && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 flex items-center gap-1">
                      <KeyRound size={10} /> Väntar på lösenordsbyte
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-gray-900 dark:text-white mb-0.5">{inspector.name}</h3>
                <div className="text-xs font-mono text-gray-500 dark:text-slate-400 mb-3">
                  @{inspector.username} {inspector.email && `· ${inspector.email}`}
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-300 border-t border-gray-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Kontor: </span>
                    {inspector.depots.length > 0 ? inspector.depots.join(', ') : 'Inget tilldelat'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Behörigheter: </span>
                    {inspector.vehicleCategories.length > 0 ? inspector.vehicleCategories.join(', ') : 'Inga tilldelade'}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleDeactivate(inspector)}
                  disabled={inspector.id === 'insp-rasmus'}
                  className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title={inspector.active ? 'Inaktivera' : 'Aktivera'}
                >
                  <Power size={15} />
                </button>
                <button
                  onClick={() => handleDelete(inspector)}
                  disabled={inspector.id === 'insp-rasmus'}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Ta bort"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#002f6c] dark:text-blue-400">
                  <UserPlus size={18} />
                </span>
                <h3 className="font-black text-base text-gray-900 dark:text-white">Ny inspektör</h3>
              </div>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    Fullständigt namn *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="T.ex. Anna Svensson"
                    className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                    Användarnamn *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="t.ex. anna.svensson"
                    className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                  E-postadress
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anna.svensson@exempel.se"
                  className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                  Roll
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('inspector')}
                    className={`h-10 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'inspector'
                        ? 'bg-[#002f6c] text-white border-[#002f6c] dark:bg-blue-600'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    Inspektör
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`h-10 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'admin'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    Administratör
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1.5">
                  Kontor
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DEPOTS.map((depot) => (
                    <button
                      key={depot}
                      type="button"
                      onClick={() => toggleDepot(depot)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                        selectedDepots.includes(depot)
                          ? 'bg-[#002f6c] text-white border-[#002f6c] dark:bg-blue-600'
                          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                      }`}
                    >
                      {depot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1.5">
                  Fordonsbehörigheter
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                        selectedCategories.includes(cat)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">
                  Tillfälligt lösenord *
                </label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Minst 4 tecken"
                  className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold font-mono focus:outline-none focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 dark:text-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Inspektören tvingas byta detta lösenord vid första inloggningen.
                </p>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 py-3 text-xs font-bold text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-xs font-black uppercase tracking-wider text-white bg-[#002f6c] dark:bg-blue-600 hover:bg-[#00204a] rounded-xl cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Skapar...' : 'Skapa inspektör'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
