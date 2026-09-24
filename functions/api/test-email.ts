interface Env {
  BREVO_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    if (!context.env.BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'BREVO_API_KEY saknas i Cloudflare' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Testmail – ProvProtokoll Förarprov</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f2f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <!-- Header -->
    <tr>
      <td style="padding: 24px 32px; background: #002F6C; color: #ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="margin-bottom: 6px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #93c5fd;">
                        PROVPROTOKOLL FÖRARPROV
                      </span>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
                        ! HÖG PRIORITET
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">
                Testmail – ProvProtokoll Förarprov
              </h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 32px 24px 32px; font-size: 14px; line-height: 1.6; color: #334155;">
        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
          Hej Rasmus!
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #002F6C; border-radius: 12px; padding: 20px 24px; margin: 16px 0 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <p style="margin: 0 0 14px 0; font-size: 14.5px; line-height: 1.65; color: #1e293b;">
            Detta är ett verifieringstest av ProvProtokolls nya e-postsystem via Brevo!
          </p>
          <p style="margin: 0 0 14px 0; font-size: 14.5px; line-height: 1.65; color: #1e293b;">
            Mejlet skickas med <strong>hög prioritet (! Hög prio)</strong> och använder sidans officiella grafiska profil i klassiskt marinblått (<code>#002F6C</code>) och krispigt vitt med full responsivitet för både mobil och dator.
          </p>
          <p style="margin: 0; font-size: 14.5px; line-height: 1.65; color: #1e293b;">
            Nu kan du skapa och skicka både officiella provprotokoll och egna anpassade <strong>fritextmejl</strong> till kandidater och trafikskolor direkt från systemet!
          </p>
        </div>

        <div style="background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 12px 18px; margin: 20px 0; font-size: 12px; color: #64748b;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td><strong>Behörighet:</strong> B</td>
              <td><strong>Provdatum:</strong> ${new Date().toISOString().split('T')[0]}</td>
              <td align="right"><strong>System:</strong> ProvProtokoll Sverige</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 13px;">Med vänlig hälsning,</p>
          <p style="margin: 3px 0 0 0; font-weight: 800; color: #002F6C; font-size: 15px;">ProvProtokoll Förarprov</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Auktoriserat prov- och förarprovssystem • protokoll.rasmusl.se</p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px 28px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #475569;">
          ProvProtokoll – Digitalt prov- och förarprovssystem
        </p>
        <p style="margin: 0 0 4px 0;">
          Detta mejl har skickats automatiskt via ProvProtokolls säkra system. Vänligen svara inte direkt på detta mejl då inkorgen inte övervakas.
        </p>
        <p style="margin: 0; color: #94a3b8;">
          Referens-ID: MSG-${Date.now().toString(36).toUpperCase()} • protokoll.rasmusl.se
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
        to: [{ email: 'Rasmus.03@hotmail.se', name: 'Rasmus Lundin' }],
        subject: 'Testmail från ProvProtokoll Förarprov',
        htmlContent,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'Priority': 'Urgent',
        },
      }),
    });

    if (!brevoRes.ok) {
      const err = await brevoRes.text();
      return new Response(JSON.stringify({ error: 'Brevo fel', detail: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: any = await brevoRes.json().catch(() => ({}));
    return new Response(
      JSON.stringify({
        success: true,
        messageId: data.messageId,
        recipient: 'Rasmus.03@hotmail.se',
        status: 'Sent with high priority',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
