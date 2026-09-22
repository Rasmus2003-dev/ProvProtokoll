import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, ShieldX, FileWarning, HeartPulse } from 'lucide-react';
import { fetchVtrEntry } from '../lib/vagtrafikregister';
import type { VagtrafikregisterEntry } from '../types';

interface VtrDetailsPanelProps {
  personalNumber: string;
}

// Fiktiv testdata i Vägtrafikregister-stil (INTE en riktig koppling till
// Transportstyrelsens register) - visar körkortsstatus, anmärkningar och
// tidigare indragningshistorik för en testkandidat.
export function VtrDetailsPanel({ personalNumber }: VtrDetailsPanelProps) {
  const [entry, setEntry] = useState<VagtrafikregisterEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVtrEntry(personalNumber).then((result) => {
      if (!cancelled) {
        setEntry(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [personalNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-gray-200 dark:border-white/10 border-t-[#002f6c] dark:border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const status = entry?.licenseStatus || 'Giltigt';
  const isOk = status === 'Giltigt';
  const isSevere = status === 'Spärrat' || status === 'Indraget';

  const Icon = isOk ? ShieldCheck : isSevere ? ShieldX : ShieldAlert;
  const colorCls = isOk
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900'
    : isSevere
      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'
      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900';

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${colorCls}`}>
        <Icon size={18} className="shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-black">{status}</div>
          {entry?.statusReason && (
            <div className="text-[11px] font-medium opacity-90 truncate">{entry.statusReason}</div>
          )}
        </div>
        {entry?.statusSince && (
          <span className="ml-auto text-[10px] font-bold opacity-70 shrink-0">sedan {entry.statusSince}</span>
        )}
      </div>

      {entry?.licenseClasses && entry.licenseClasses.length > 0 && (
        <div className="text-xs text-gray-600 dark:text-slate-300">
          <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Innehavda behörigheter: </span>
          {entry.licenseClasses.join(', ')}
        </div>
      )}

      {entry?.previousRevocations ? (
        <div className="text-xs text-gray-600 dark:text-slate-300 flex items-center gap-1.5">
          <FileWarning size={13} className="text-amber-500 shrink-0" />
          <span>{entry.previousRevocations} tidigare indragning(ar) i registret</span>
        </div>
      ) : null}

      {entry?.medicalRestriction && (
        <div className="text-xs text-gray-600 dark:text-slate-300 flex items-center gap-1.5">
          <HeartPulse size={13} className="text-blue-500 shrink-0" />
          <span>{entry.medicalRestriction}</span>
        </div>
      )}

      {entry?.remarks && entry.remarks.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Övriga anmärkningar</div>
          <ul className="space-y-1">
            {entry.remarks.map((remark, idx) => (
              <li key={idx} className="text-xs text-gray-600 dark:text-slate-300 flex items-start gap-1.5">
                <span className="text-gray-300 dark:text-slate-600 mt-0.5">•</span>
                <span>{remark}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOk && !entry?.remarks?.length && (
        <p className="text-[11px] text-gray-400 dark:text-slate-500 italic">
          Inga anmärkningar registrerade.
        </p>
      )}
    </div>
  );
}
