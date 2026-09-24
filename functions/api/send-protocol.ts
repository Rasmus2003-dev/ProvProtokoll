import { AuthEnv, verifyInspector } from '../../server-lib/supabaseAuth';

interface Env extends AuthEnv {
  BREVO_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Bara inloggade inspektörer får skicka mejl från info@rasmusl.se
    const verified = await verifyInspector(context.request, context.env);
    if ('error' in verified) return verified.error;

    const { to, toName, subject, html } = (await context.request.json()) as {
      to: string;
      toName?: string;
      subject: string;
      html: string;
    };

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'to, subject och html krävs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!context.env.BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'E-posttjänsten är inte konfigurerad' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': context.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'ProvProtokoll Förarprov', email: 'info@rasmusl.se' },
        replyTo: { name: 'Svara inte på detta mejl', email: 'noreply@rasmusl.se' },
        to: [{ email: to, name: toName || undefined }],
        subject,
        htmlContent: html,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'Priority': 'Urgent',
        },
      }),
    });

    if (!brevoRes.ok) {
      const errBody = await brevoRes.text();
      return new Response(JSON.stringify({ error: 'Kunde inte skicka mejlet', detail: errBody }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const brevoBody = await brevoRes.json().catch(() => ({} as any));

    // messageId behövs för att i efterhand kunna slå upp den faktiska
    // leveransstatusen (Delivered/Bounced/Blocked/Spam) hos Brevo — ett
    // lyckat svar här betyder bara att Brevo tog emot mejlet för utskick,
    // inte att det faktiskt nått mottagarens inkorg.
    return new Response(JSON.stringify({ status: 'sent', messageId: brevoBody?.messageId || null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Ett oväntat fel inträffade' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
