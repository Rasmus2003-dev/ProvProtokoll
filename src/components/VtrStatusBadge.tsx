import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { fetchVtrEntry } from '../lib/vagtrafikregister';
import type { VagtrafikregisterEntry } from '../types';

interface VtrStatusBadgeProps {
  personalNumber: string;
  compact?: boolean;
}

// Fiktiv testdata i samma anda som Transportstyrelsens vägtrafikregister
// (körkortsstatus, indraget/spärrat körkort, anmärkningar) - INTE en riktig
// koppling till registret, bara testdata knuten till fiktiva testkandidater.
export function VtrStatusBadge({ personalNumber, compact = false }: VtrStatusBadgeProps) {
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

  if (loading) return null;

  const status = entry?.licenseStatus || 'Giltigt';
  const isOk = status === 'Giltigt';

  if (isOk && compact) return null; // Ingen badge behövs för normalfallet i kompakt läge

  const styleFor = () => {
    if (status === 'Giltigt') {
      return { icon: ShieldCheck, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-900' };
    }
    if (status === 'Spärrat' || status === 'Indraget') {
      return { icon: ShieldX, cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900' };
    }
    return { icon: ShieldAlert, cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900' };
  };

  const { icon: Icon, cls } = styleFor();

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${cls}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}
