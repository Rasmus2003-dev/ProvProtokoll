import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getSessionInspector, signOut } from '../lib/inspectors';
import { useAppStore } from '../store/ProvContext';

export type AuthStatus = 'checking' | 'signed-in' | 'signed-out';

// Avgör om inspektören är inloggad.
// Med Supabase: en giltig Auth-session + aktiv inspektörsprofil krävs.
// Utan uppkoppling litar vi på en befintlig session (provet ska gå att
// genomföra i bilen) – datan skyddas ändå av databasens RLS vid synk.
export function useAuthGate() {
  const { updateProfile } = useAppStore();
  const supabaseMode = isSupabaseConfigured();
  const [status, setStatus] = useState<AuthStatus>(() => {
    if (!supabaseMode) return localStorage.getItem('provprotokoll-is-logged-in') === 'true' ? 'signed-in' : 'signed-out';
    return 'checking';
  });

  const verify = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setStatus('signed-out');
      return;
    }
    try {
      const inspector = await getSessionInspector();
      if (!inspector) {
        // Inaktiverat eller borttaget konto
        await signOut();
        setStatus('signed-out');
        return;
      }
      updateProfile({
        name: inspector.name,
        inspectorId: inspector.id,
        email: inspector.email,
        depot: inspector.depots.join(', ') || 'Ej tilldelat kontor',
        vehicleCategories: inspector.vehicleCategories,
        role: inspector.role,
      });
      setStatus('signed-in');
    } catch {
      // Nätverksfel (offline) – behåll den befintliga sessionen
      setStatus('signed-in');
    }
  }, [updateProfile]);

  useEffect(() => {
    if (!supabaseMode) return;
    verify();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setStatus('signed-out');
    });
    return () => data.subscription.unsubscribe();
  }, [supabaseMode, verify]);

  return {
    status,
    onLoginSuccess: () => setStatus('signed-in'),
  };
}
