import { AuthEnv, handleAdminInspectors } from '../../../server-lib/supabaseAuth';

// Skapa konto, återställ lösenord och ta bort inspektör. Kräver inloggad admin.
// SUPABASE_SERVICE_ROLE_KEY läggs in som hemlighet i Cloudflare – aldrig i appen.
export const onRequestPost: PagesFunction<AuthEnv> = async (context) => {
  try {
    return await handleAdminInspectors(context.request, context.env);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Ett oväntat fel inträffade' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
