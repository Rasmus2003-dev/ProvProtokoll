interface Env {
  BREVO_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
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
        sender: { name: 'ProvProtokoll (Svara inte)', email: 'info@rasmusl.se' },
        replyTo: { name: 'Svara inte på detta mejl', email: 'noreply@rasmusl.se' },
        to: [{ email: to, name: toName || undefined }],
        subject,
        htmlContent: html,
      }),
    });

    if (!brevoRes.ok) {
      const errBody = await brevoRes.text();
      return new Response(JSON.stringify({ error: 'Kunde inte skicka mejlet', detail: errBody }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: 'sent' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Ett oväntat fel inträffade' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
