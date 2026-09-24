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
  <title>Resultat från ditt körprov (Behörighet B) – Rasmus Lundin</title>
  <style>
    body { margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 660px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); }
    @media only screen and (max-width: 600px) {
      .card-pad { padding: 20px 16px !important; }
      .header-pad { padding: 20px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 660px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
    
    <!-- Top Navy Brand Bar -->
    <tr>
      <td class="header-pad" style="padding: 24px 32px; background: #002F6C; color: #ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="margin-bottom: 6px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #93c5fd;">
                        PROVPROTOKOLL • OFFICIELLT FÖRARPROV
                      </span>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.06em; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                        ! HÖG PRIORITET
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">
                Resultat från ditt körprov
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #cbd5e1;">
                Officiellt provbesked från ProvProtokoll Sverige
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Status Banner: Godkänt -->
    <tr>
      <td style="padding: 24px 32px 0 32px;" class="card-pad">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 6px solid #16a34a; border-radius: 12px; padding: 18px 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #15803d; margin-bottom: 3px;">
                  Slutgiltigt beslut
                </div>
                <div style="font-size: 21px; font-weight: 900; color: #166534; line-height: 1.2; letter-spacing: -0.01em;">
                  ✓ KÖRPROVET ÄR GODKÄNT
                </div>
                <div style="margin-top: 5px; font-size: 13px; font-weight: 700; color: #15803d;">
                  Behörighet uppnådd: B (Personbil)
                </div>
              </td>
              <td align="right" style="vertical-align: middle;">
                <div style="display: inline-block; background: #16a34a; color: #ffffff; font-weight: 900; font-size: 13px; padding: 7px 16px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.06em; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.25);">
                  BEHÖRIG B
                </div>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td class="card-pad" style="padding: 24px 32px 28px 32px; font-size: 14px; line-height: 1.6; color: #334155;">
        
        <div style="font-size: 15px; line-height: 1.6; color: #1e293b; margin-bottom: 20px;">
          Hej <strong>Rasmus</strong>! Här kommer ditt provresultat!<br />
          Gratulerar! Ditt körprov har genomförts och bedömts som <strong>Godkänt</strong> av förarprövaren. Nedan redovisas ditt officiella provprotokoll med genomgångna moment och intygande.
        </div>

        <!-- Kandidatinformation & Provdata Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 22px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            Prov- och kandidatinformation
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; width: 140px;">Kandidat:</td>
              <td style="padding: 5px 0; font-weight: 800; color: #0f172a;">Rasmus Lundin</td>
              <td style="padding: 5px 0; color: #64748b; width: 100px;">Provdatum:</td>
              <td style="padding: 5px 0; font-weight: 700; color: #0f172a;" align="right">2026-09-24</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Personnummer:</td>
              <td style="padding: 5px 0; font-family: monospace; font-weight: 700; color: #0f172a;">20030514-••••</td>
              <td style="padding: 5px 0; color: #64748b;">Provplats:</td>
              <td style="padding: 5px 0; font-weight: 700; color: #0f172a;" align="right">Förarprovskontoret</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Sökt behörighet:</td>
              <td style="padding: 5px 0; font-weight: 800; color: #002F6C;">B (Personbil)</td>
              <td style="padding: 5px 0; color: #64748b;">Växellåda:</td>
              <td style="padding: 5px 0; font-weight: 700; color: #0f172a;" align="right">Manuell</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Förarprövare:</td>
              <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">Hans Eriksson</td>
              <td style="padding: 5px 0; color: #64748b;">Provtyp:</td>
              <td style="padding: 5px 0; font-weight: 700; color: #0f172a;" align="right">Förarprov B</td>
            </tr>
          </table>
        </div>

        <!-- Bedömda moment -->
        <div style="margin-bottom: 22px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; margin-bottom: 10px;">
            Bedömda delmoment
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
            <tr style="background: #f8fafc; font-weight: 800; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Moment / Delområde</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;" align="center">Krav</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;" align="right">Bedömning</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #1e293b;">1. Säkerhetskontroll & körställning</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #64748b;" align="center">Genomförd</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: #16a34a;" align="right">✓ Godkänt</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #1e293b;">2. Manövrering, start & backning</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #64748b;" align="center">Självständig</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: #16a34a;" align="right">✓ Godkänt</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #1e293b;">3. Körning i tätort & korsningar</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #64748b;" align="center">Trafiksäker</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: #16a34a;" align="right">✓ Godkänt</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #1e293b;">4. Landsväg & motorväg / motortrafikled</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #64748b;" align="center">Anpassad</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: #16a34a;" align="right">✓ Godkänt</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: 700; color: #1e293b;">5. Miljö, planering & samspel</td>
              <td style="padding: 10px 14px; color: #64748b;" align="center">Ecodriving</td>
              <td style="padding: 10px 14px; font-weight: 800; color: #16a34a;" align="right">✓ Godkänt</td>
            </tr>
          </table>
        </div>

        <!-- Prövarens kommentar -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #002F6C; border-radius: 10px; padding: 14px 18px; margin-bottom: 22px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #002F6C; margin-bottom: 4px;">
            Prövarens helhetsomdöme
          </div>
          <p style="margin: 0; font-size: 13.5px; line-height: 1.6; color: #1e293b;">
            "Mycket god uppmärksamhet och säker planering i varierande trafikmiljöer. Tydligt samspel med oskyddade trafikanter och god avsökning i cirkulationsplatser. Körkortet är välförtjänt!"
          </p>
        </div>

        <!-- Vad händer nu / Information -->
        <div style="background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px 18px; margin-bottom: 24px; font-size: 12.5px; color: #475569; line-height: 1.55;">
          <strong style="color: #0f172a;">Vad händer nu?</strong><br />
          Resultatet är elektroniskt rapporterat till Transportstyrelsen. Du får köra personbil direkt i Sverige med ditt provprotokoll och giltig legitimation i väntan på att ditt permanenta plastkörkort levereras med posten.
        </div>

        <!-- Officiell signatur -->
        <div style="padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 13px;">Handläggare / Förarprövare:</p>
                <p style="margin: 3px 0 0 0; font-weight: 800; color: #002F6C; font-size: 15px;">Hans Eriksson</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">ProvProtokoll Förarprov Sverige • protokoll.rasmusl.se</p>
              </td>
              <td align="right" style="vertical-align: bottom;">
                <div style="display: inline-block; padding: 6px 12px; background: #f1f5f9; border-radius: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px; color: #475569; font-weight: 700;">
                  REG: ${Date.now().toString(36).toUpperCase()}-OK
                </div>
              </td>
            </tr>
          </table>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px 28px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;" class="card-pad">
        <p style="margin: 0; color: #94a3b8;">
          ProvProtokoll Förarprov Sverige • Referens: PROV-${new Date().getFullYear()}-B-8839 • protokoll.rasmusl.se
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
        sender: { name: 'Provresultat', email: 'info@rasmusl.se' },
        replyTo: { name: 'ProvProtokoll', email: 'noreply@rasmusl.se' },
        to: [{ email: 'Rasmus.03@hotmail.se', name: 'Rasmus Lundin' }],
        subject: 'Provresultat – Resultat från ditt körprov (Behörighet B)',
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
