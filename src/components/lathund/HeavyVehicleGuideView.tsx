import React, { useState } from 'react';
import { 
  Truck, 
  Bus, 
  Gauge, 
  Link as LinkIcon, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Search,
  Scale,
  Maximize2,
  FileCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  HEAVY_VEHICLE_REQUIREMENTS, 
  AIR_BRAKE_STEPS, 
  COUPLING_CHECKLIST,
  HeavyVehicleRequirement 
} from '../../data/heavyVehicleSpecs';

export function HeavyVehicleGuideView() {
  const [selectedCode, setSelectedCode] = useState<string>('CE');
  const [activeSubTab, setActiveSubTab] = useState<'krav' | 'tryckluft' | 'koppling'>('krav');
  const [searchFilter, setSearchFilter] = useState('');

  const currentReq = HEAVY_VEHICLE_REQUIREMENTS[selectedCode] || HEAVY_VEHICLE_REQUIREMENTS['C'];
  const isBus = ['D1', 'D', 'D1E', 'DE'].includes(selectedCode);
  const isTrailer = ['C1E', 'CE', 'D1E', 'DE'].includes(selectedCode);

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-700/80">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                TSFS 2012:43 / TSFS 2020:34
              </span>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                Fordonsteknisk Lathund: Tunga Fordon
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Komplett översikt över provfordonskrav, tryckluftskontroll och kopplingsrutiner för C- och D-behörigheter.
            </p>
          </div>

          {/* Sub-tab selection */}
          <div className="flex bg-gray-200/80 dark:bg-slate-900 p-1 rounded-xl border border-gray-300 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setActiveSubTab('krav')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'krav'
                  ? 'bg-white dark:bg-slate-800 text-[#002f6c] dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Truck size={14} /> Provfordonskrav
            </button>
            <button
              onClick={() => setActiveSubTab('tryckluft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'tryckluft'
                  ? 'bg-white dark:bg-slate-800 text-[#002f6c] dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Gauge size={14} /> Tryckluftsguide
            </button>
            <button
              onClick={() => setActiveSubTab('koppling')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'koppling'
                  ? 'bg-white dark:bg-slate-800 text-[#002f6c] dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <LinkIcon size={14} /> Koppling / Släp
            </button>
          </div>
        </div>

        {/* License Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Välj behörighet:</span>
          {Object.keys(HEAVY_VEHICLE_REQUIREMENTS).map((code) => {
            const isSelected = selectedCode === code;
            const bus = ['D1', 'D', 'D1E', 'DE'].includes(code);
            return (
              <button
                key={code}
                onClick={() => setSelectedCode(code)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#002f6c] text-white border-[#002f6c] shadow-sm scale-105'
                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                {bus ? <Bus size={13} /> : <Truck size={13} />}
                <span>{code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW 1: PROVFORDONSKRAV */}
      {activeSubTab === 'krav' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weight card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-[#002f6c] dark:text-blue-400 mb-2">
                <Scale size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider">Viktkrav för provfordon</h4>
              </div>
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <div><strong className="text-gray-900 dark:text-white">Min. totalvikt:</strong> {currentReq.minTotalWeight}</div>
                <div><strong className="text-gray-900 dark:text-white">Provets bruttovikt:</strong> {currentReq.actualMinWeight}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg">
                  {currentReq.cargoLoadRequirement}
                </div>
              </div>
            </div>

            {/* Dimension card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-2">
                <Maximize2 size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider">Minimimått & Kaross</h4>
              </div>
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <div><strong className="text-gray-900 dark:text-white">Längd:</strong> {currentReq.dimensions.minLength}</div>
                {currentReq.dimensions.minWidth && (
                  <div><strong className="text-gray-900 dark:text-white">Bredd:</strong> {currentReq.dimensions.minWidth}</div>
                )}
                {currentReq.dimensions.cargoHeight && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {currentReq.dimensions.cargoHeight}
                  </div>
                )}
              </div>
            </div>

            {/* Transmission card */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 mb-2">
                <Zap size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider">Växellåda & Drivlina</h4>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentReq.transmissionRequirement}
              </p>
            </div>
          </div>

          {/* Mandatory Equipment & Key Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>Obligatorisk Utrustning på Provfordonet</span>
              </h3>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {currentReq.mandatoryEquipment.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-3">
                <Info size={16} className="text-amber-500" />
                <span>Viktiga Regler & Inspektörsanvisningar ({selectedCode})</span>
              </h3>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {currentReq.keyRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: TRYCKLUFTSGUIDE */}
      {activeSubTab === 'tryckluft' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 p-4 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <Info size={18} className="shrink-0 text-blue-600 mt-0.5" />
            <div>
              <span className="font-bold">Bedömningsriktlinje för tryckluftsbromsar:</span> Kandidaten ska inte bara kunna avläsa manometern utan också förstå orsak och verkan. Ett för stort tryckfall innebär direkt körförbud tills kompressorns förmåga prövats på tomgång.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {AIR_BRAKE_STEPS.map((step) => (
              <div 
                key={step.step}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-blue-300 dark:hover:border-blue-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-[#002f6c] text-white flex items-center justify-center font-black text-xs shrink-0">
                      {step.step}
                    </span>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                    Norm: {step.expectedValue}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Hur kontrollen utförs:</span>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.action}
                    </p>
                  </div>
                  <div className="bg-red-50/60 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                    <span className="font-bold text-red-800 dark:text-red-400 block mb-1 flex items-center gap-1.5">
                      <AlertTriangle size={13} /> Trafiksäkerhetsrisk & Konsekvens:
                    </span>
                    <p className="text-red-700 dark:text-red-300 leading-relaxed text-[11px]">
                      {step.failureRisk}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: KOPPLING & SLÄP */}
      {activeSubTab === 'koppling' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Isärkoppling */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  Korrekt Isärkoppling (Ordning)
                </h3>
              </div>

              <div className="space-y-2.5">
                {COUPLING_CHECKLIST.disconnectOrder.map(item => (
                  <div key={item.nr} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-bold font-mono text-gray-400 shrink-0 mt-0.5">0{item.nr}.</span>
                    <span className={item.text.includes('RÖD') ? 'font-semibold text-red-700 dark:text-red-400' : ''}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sammankoppling */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  Korrekt Sammankoppling (Ordning)
                </h3>
              </div>

              <div className="space-y-2.5">
                {COUPLING_CHECKLIST.connectOrder.map(item => (
                  <div key={item.nr} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-bold font-mono text-gray-400 shrink-0 mt-0.5">0{item.nr}.</span>
                    <span className={item.text.includes('DRAGPROV') || item.text.includes('GUL FÖRST') ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong className="block mb-0.5">Mnemoteknisk minnesregel för luftslangar:</strong>
              Röd slang (matning) kopplas <em>loss först</em> vid isärkoppling (så släpet tvärnitar direkt), och kopplas <em>sist</em> vid sammankoppling (efter att manöverledningen är ansluten och dragprovet är utfört).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
