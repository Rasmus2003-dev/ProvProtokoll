// Serverlogik för inloggningskontroll och kontohantering.
// Används av Cloudflare Pages Functions (produktion) och server.ts (lokalt).
// Bara fetch – inga Node-specifika beroenden.
import { MIN_PASSWORD_LENGTH, isValidUsername, usernameToEmail } from '../src/lib/authConfig';

export interface AuthEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export interface VerifiedInspector {
  authId: string;
  inspectorId: string;
  role: 'admin' | 'inspector';
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function bearer(request: Request): string | null {
  const header = request.headers.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Kontrollerar att anropet kommer från en inloggad, aktiv inspektör.
 * Returnerar inspektören, eller ett felsvar att skicka tillbaka.
 */
export async function verifyInspector(
  request: Request,
  env: AuthEnv
): Promise<{ inspector: VerifiedInspector } | { error: Response }> {
  const url = env.SUPABASE_URL;
  const anon = env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { error: json({ error: 'Servern saknar Supabase-konfiguration (SUPABASE_URL/SUPABASE_ANON_KEY).' }, 503) };
  }
  const token = bearer(request);
  if (!token) return { error: json({ error: 'Inloggning krävs.' }, 401) };

  const userRes = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  if (!userRes.ok) return { error: json({ error: 'Sessionen är ogiltig eller har gått ut. Logga in igen.' }, 401) };
  const user = (await userRes.json()) as { id: string };

  // Med användarens egen token: RLS släpper bara igenom den egna raden
  const rowRes = await fetch(`${url}/rest/v1/inspectors?auth_id=eq.${user.id}&select=id,role,active`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` },
  });
  const rows = rowRes.ok ? ((await rowRes.json()) as { id: string; role: 'admin' | 'inspector'; active: boolean }[]) : [];
  const row = rows[0];
  if (!row) return { error: json({ error: 'Kontot saknar inspektörsprofil.' }, 403) };
  if (!row.active) return { error: json({ error: 'Kontot är inaktiverat.' }, 403) };

  return { inspector: { authId: user.id, inspectorId: row.id, role: row.role } };
}

// ---------- Kontohantering (endast admin) ----------

interface AdminRequestBody {
  action: 'create' | 'reset-password' | 'delete';
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'inspector';
  depots?: string[];
  vehicleCategories?: string[];
  temporaryPassword?: string;
}

export async function handleAdminInspectors(request: Request, env: AuthEnv): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Metoden stöds inte.' }, 405);

  const verified = await verifyInspector(request, env);
  if ('error' in verified) return verified.error;
  if (verified.inspector.role !== 'admin') return json({ error: 'Endast administratörer får hantera konton.' }, 403);

  const url = env.SUPABASE_URL!;
  const service = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!service) {
    return json({ error: 'Servern saknar SUPABASE_SERVICE_ROLE_KEY. Lägg in den som hemlighet i Cloudflare.' }, 503);
  }
  const adminHeaders = { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' };

  let body: AdminRequestBody;
  try {
    body = (await request.json()) as AdminRequestBody;
  } catch {
    return json({ error: 'Ogiltig begäran.' }, 400);
  }

  const findInspector = async (id: string) => {
    const res = await fetch(`${url}/rest/v1/inspectors?id=eq.${encodeURIComponent(id)}&select=id,auth_id,username`, { headers: adminHeaders });
    const rows = res.ok ? ((await res.json()) as { id: string; auth_id: string | null; username: string }[]) : [];
    return rows[0] || null;
  };

  const passwordError = (pw?: string) =>
    !pw || pw.length < MIN_PASSWORD_LENGTH ? `Lösenordet måste vara minst ${MIN_PASSWORD_LENGTH} tecken.` : null;

  if (body.action === 'create') {
    const username = (body.username || '').trim().toLowerCase();
    if (!isValidUsername(username)) {
      return json({ error: 'Ogiltigt användarnamn. Använd a–z, 0–9, punkt, bindestreck eller understreck.' }, 400);
    }
    if (!body.name?.trim()) return json({ error: 'Namn krävs.' }, 400);
    const pwErr = passwordError(body.temporaryPassword);
    if (pwErr) return json({ error: pwErr }, 400);

    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email: usernameToEmail(username),
        password: body.temporaryPassword,
        email_confirm: true,
        user_metadata: { username, name: body.name.trim() },
      }),
    });
    if (!createRes.ok) {
      const detail = await createRes.text();
      const exists = /already|registered|exists/i.test(detail);
      return json({ error: exists ? 'Ett konto med det användarnamnet finns redan.' : 'Kunde inte skapa kontot.', detail }, exists ? 409 : 502);
    }
    const authUser = (await createRes.json()) as { id: string };

    const insertRes = await fetch(`${url}/rest/v1/inspectors`, {
      method: 'POST',
      headers: { ...adminHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({
        id: `insp-${crypto.randomUUID()}`,
        username,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        role: body.role === 'admin' ? 'admin' : 'inspector',
        depots: body.depots || [],
        vehicle_categories: body.vehicleCategories || [],
        must_change_password: true,
        active: true,
        auth_id: authUser.id,
      }),
    });
    if (!insertRes.ok) {
      // Städa bort Auth-användaren så att användarnamnet inte blir "upptaget"
      await fetch(`${url}/auth/v1/admin/users/${authUser.id}`, { method: 'DELETE', headers: adminHeaders });
      const detail = await insertRes.text();
      return json({ error: /duplicate|unique/i.test(detail) ? 'Ett konto med det användarnamnet finns redan.' : 'Kunde inte spara inspektörsprofilen.', detail }, 502);
    }
    return json({ success: true });
  }

  if (!body.id) return json({ error: 'id krävs.' }, 400);
  if (body.id === verified.inspector.inspectorId) {
    return json({ error: 'Du kan inte återställa eller ta bort ditt eget konto här.' }, 400);
  }
  const target = await findInspector(body.id);
  if (!target) return json({ error: 'Inspektören hittades inte.' }, 404);

  if (body.action === 'reset-password') {
    const pwErr = passwordError(body.temporaryPassword);
    if (pwErr) return json({ error: pwErr }, 400);
    if (!target.auth_id) return json({ error: 'Kontot saknar inloggning. Ta bort och skapa det igen.' }, 400);
    const res = await fetch(`${url}/auth/v1/admin/users/${target.auth_id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ password: body.temporaryPassword }),
    });
    if (!res.ok) return json({ error: 'Kunde inte återställa lösenordet.', detail: await res.text() }, 502);
    await fetch(`${url}/rest/v1/inspectors?id=eq.${encodeURIComponent(target.id)}`, {
      method: 'PATCH',
      headers: { ...adminHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({ must_change_password: true }),
    });
    return json({ success: true });
  }

  if (body.action === 'delete') {
    if (target.auth_id) {
      // Raden försvinner via on delete cascade
      const res = await fetch(`${url}/auth/v1/admin/users/${target.auth_id}`, { method: 'DELETE', headers: adminHeaders });
      if (!res.ok && res.status !== 404) return json({ error: 'Kunde inte ta bort kontot.', detail: await res.text() }, 502);
    }
    await fetch(`${url}/rest/v1/inspectors?id=eq.${encodeURIComponent(target.id)}`, { method: 'DELETE', headers: adminHeaders });
    return json({ success: true });
  }

  return json({ error: 'Okänd åtgärd.' }, 400);
}
