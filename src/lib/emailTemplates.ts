import provprotokollLogoImg from '../assets/images/provprotokoll_logo.png';
import { authHeaders } from './inspectors';

export type EmailTemplateType = 'kallelse' | 'paminnelse' | 'trafikskola' | 'intyg' | 'custom';

export interface EmailParams {
  to: string;
  toName: string;
  templateType: EmailTemplateType;
  licenseType?: string;
  testDate?: string;
  bookingTime?: string;
  location?: string;
  examiner?: string;
  schoolName?: string;
  result?: string;
  customSubject?: string;
  customMessage?: string;
}

export const EMAIL_TEMPLATES: { id: EmailTemplateType; label: string; description: string; defaultSubject: string }[] = [
  {
    id: 'custom',
    label: '✍️ Fritextmejl (Eget meddelande)',
    description: 'Skriv eget meddelande i ProvProtokolls officiella design med hög prioritet',
    defaultSubject: 'Viktigt meddelande – ProvProtokoll Förarprov',
  },
  {
    id: 'kallelse',
    label: '📅 Kallelse / Bokning',
    description: 'Officiell kallelse med tid, plats, villkor och legitimation',
    defaultSubject: 'Kallelse till körprov',
  },
  {
    id: 'paminnelse',
    label: '⏰ Påminnelse',
    description: 'Skickas 24–48h innan provet med kom-ihåg punkter',
    defaultSubject: 'Påminnelse inför ditt körprov imorgon',
  },
  {
    id: 'trafikskola',
    label: '🏫 Rapport till Trafikskola',
    description: 'Pedagogisk sammanställning till elevens utbildare',
    defaultSubject: 'Resultat och provsammanfattning för elev',
  },
  {
    id: 'intyg',
    label: '📜 Officiellt Intyg',
    description: 'Officiellt intyg för arbetsgivare, skola eller myndighet',
    defaultSubject: 'Intyg – Genomfört förarprov',
  },
];

function wrapHtmlTemplate(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
                ${title}
              </h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 32px 24px 32px; font-size: 14px; line-height: 1.6; color: #334155;">
        ${contentHtml}
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
}

export function generateTemplateEmailHtml(params: EmailParams): { subject: string; html: string } {
  const {
    toName,
    templateType,
    licenseType = 'B',
    testDate = new Date().toISOString().split('T')[0],
    bookingTime = '09:00',
    location = 'Förarprovskontoret',
    examiner = 'Trafikinspektör',
    schoolName = 'Trafikskolan',
    result = 'Godkänt',
    customSubject,
    customMessage
  } = params;

  if (templateType === 'kallelse') {
    const subject = `Kallelse till körprov för behörighet ${licenseType} – ${testDate}`;
    const content = `
      <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">Hej ${toName}!</p>
      <p>Du är välkommen till ditt körprov för <strong>behörighet ${licenseType}</strong>.</p>

      <div style="background: #f1f5f9; border-left: 4px solid #002F6C; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 130px; font-weight: 600;">Datum:</td>
            <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${testDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Tid:</td>
            <td style="padding: 4px 0; font-weight: 700; color: #002F6C;">${bookingTime} (Var på plats 15 min innan)</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Plats:</td>
            <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${location}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Behörighet:</td>
            <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${licenseType}</td>
          </tr>
        </table>
      </div>

      <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 24px 0 8px 0; letter-spacing: 0.05em;">
        Viktigt att tänka på inför provet:
      </h3>
      <ul style="padding-left: 20px; margin: 0 0 20px 0; color: #334155;">
        <li style="margin-bottom: 6px;"><strong>Ta med giltig legitimation:</strong> Körkort, pass eller nationellt ID-kort är ett absolut krav för att få starta provet.</li>
        <li style="margin-bottom: 6px;"><strong>Om du har villkor för glasögon/linser:</strong> Kom ihåg att bära eller ta med dem till provet.</li>
        <li style="margin-bottom: 6px;"><strong>Provfordon:</strong> Fordonet ska uppfylla Transportstyrelsens formella krav för behörighet ${licenseType}.</li>
      </ul>

      <p style="margin-top: 24px; color: #475569;">Lycka till med ditt körprov!</p>
      <p style="margin: 0; font-weight: 700; color: #0f172a;">Vänliga hälsningar,<br>${examiner}</p>
    `;
    return { subject, html: wrapHtmlTemplate(`Kallelse till körprov (${licenseType})`, content) };
  }

  if (templateType === 'paminnelse') {
    const subject = `Påminnelse: Ditt körprov för behörighet ${licenseType} äger rum snart`;
    const content = `
      <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">Hej ${toName}!</p>
      <p>Detta är en vänlig påminnelse om att ditt körprov för <strong>behörighet ${licenseType}</strong> närmar sig.</p>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #1e40af; font-weight: 700;">📅 PROVTID OCH PLATS:</p>
        <p style="margin: 0; font-size: 15px; font-weight: 800; color: #1e3a8a;">
          ${testDate} kl. ${bookingTime} på ${location}
        </p>
      </div>

      <p style="font-weight: 700; color: #0f172a;">Checklista inför provdagen:</p>
      <ul style="padding-left: 20px; margin: 0 0 20px 0; color: #334155;">
        <li style="margin-bottom: 6px;">Giltig fysisk ID-handling (pass, nationellt ID-kort eller svenskt körkort).</li>
        <li style="margin-bottom: 6px;">Kom i god tid – gärna 15 minuter innan provtiden.</li>
        <li style="margin-bottom: 6px;">Var utvilad och förberedd på säkerhetskontrollen.</li>
      </ul>

      <p style="margin: 0; font-weight: 700; color: #0f172a;">Varmt välkommen!<br>${examiner}</p>
    `;
    return { subject, html: wrapHtmlTemplate(`Påminnelse inför körprov`, content) };
  }

  if (templateType === 'trafikskola') {
    const subject = `Provrapport för elev ${toName} (${licenseType}) – ${result}`;
    const content = `
      <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">Till ${schoolName} / Utbildare,</p>
      <p>Här kommer en sammanfattning av genomfört körprov för eleven <strong>${toName}</strong> för behörighet <strong>${licenseType}</strong>.</p>

      <div style="background: ${result === 'Godkänt' ? '#ecfdf5' : '#fef2f2'}; border: 1px solid ${result === 'Godkänt' ? '#a7f3d0' : '#fecaca'}; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${result === 'Godkänt' ? '#047857' : '#b91c1c'};">Provresultat:</span>
        <h2 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 800; color: ${result === 'Godkänt' ? '#065f46' : '#991b1b'};">
          ${result.toUpperCase()}
        </h2>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #475569;">
          Datum: ${testDate} • Förarprövare: ${examiner}
        </p>
      </div>

      ${customMessage ? `
        <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 14px 16px; margin: 16px 0;">
          <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Inspektörens noteringar till trafikskolan:</div>
          <p style="margin: 0; font-size: 13px; color: #1e293b; white-space: pre-wrap;">${customMessage}</p>
        </div>
      ` : ''}

      <p style="font-size: 13px; color: #64748b;">
        Den fullständiga protokollskopian finns även registrerad i ProvProtokoll.
      </p>

      <p style="margin: 20px 0 0 0; font-weight: 700; color: #0f172a;">Med vänlig hälsning,<br>${examiner}</p>
    `;
    return { subject, html: wrapHtmlTemplate(`Provrapport till Trafikskola`, content) };
  }

  if (templateType === 'intyg') {
    const subject = `Intyg om genomfört förarprov för ${toName} (${licenseType})`;
    const content = `
      <div style="text-align: center; border-bottom: 2px solid #002F6C; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #002F6C; letter-spacing: -0.01em;">INTYG OM GENOMFÖRT FÖRARPROV</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #64748b;">Utfärdat via ProvProtokolls auktoriserade provsystem</p>
      </div>

      <p>Härmed intygas att följande kandidat har genomfört förarprov enligt gällande föreskrifter:</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; margin: 20px 0; background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px;">Kandidatens namn:</td>
          <td style="padding: 6px 0; font-weight: 800; color: #0f172a;">${toName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Sökt behörighet:</td>
          <td style="padding: 6px 0; font-weight: 800; color: #0f172a;">${licenseType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Provdatum:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${testDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Resultat:</td>
          <td style="padding: 6px 0; font-weight: 800; color: ${result === 'Godkänt' ? '#059669' : '#dc2626'};">${result}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Ansvarig prövare:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${examiner}</td>
        </tr>
      </table>

      ${customMessage ? `<p style="font-size: 13px; color: #334155; margin: 16px 0;">${customMessage}</p>` : ''}

      <div style="margin-top: 32px; border-top: 1px dashed #cbd5e1; pt-4">
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">
          Elektroniskt intygat och registrerat i ProvProtokoll.<br>
          Datum för utfärdande: ${new Date().toLocaleDateString('sv-SE')}
        </p>
      </div>
    `;
    return { subject, html: wrapHtmlTemplate(`Intyg – Genomfört förarprov`, content) };
  }

  // Custom / Fritext
  const subject = customSubject || `Meddelande angående ditt förarprov – ProvProtokoll`;
  const rawMsg = customMessage || 'Vi har ett meddelande gällande ditt förarprov.';
  const formattedParagraphs = rawMsg
    .split(/\n\s*\n/)
    .map(p => `<p style="margin: 0 0 14px 0; font-size: 14.5px; line-height: 1.65; color: #1e293b;">${p.trim().replace(/\n/g, '<br />')}</p>`)
    .join('');

  const content = `
    <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
      Hej ${toName}!
    </div>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #002F6C; border-radius: 12px; padding: 20px 24px; margin: 16px 0 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      ${formattedParagraphs}
    </div>

    <div style="background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 12px 18px; margin: 20px 0; font-size: 12px; color: #64748b;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td><strong>Behörighet:</strong> ${licenseType}</td>
          <td><strong>Datum:</strong> ${testDate}</td>
          <td align="right"><strong>Handläggare:</strong> ${examiner}</td>
        </tr>
      </table>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 13px;">Med vänlig hälsning,</p>
      <p style="margin: 3px 0 0 0; font-weight: 800; color: #002F6C; font-size: 15px;">${examiner}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">ProvProtokoll Förarprov Sverige • protokoll.rasmusl.se</p>
    </div>
  `;
  return { subject, html: wrapHtmlTemplate(subject, content) };
}

/**
 * Skickar ett systemmejl via backend-tjänsten (Brevo API)
 */
export async function sendSystemEmail(params: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string; messageId?: string | null }> {
  if (!params.to) {
    return { success: false, error: 'Mottagarens e-postadress saknas.' };
  }

  try {
    const res = await fetch('/api/send-protocol', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      },
      body: JSON.stringify({
        to: params.to.trim(),
        toName: params.toName,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Kunde inte skicka mejlet.' };
    }

    const data = await res.json().catch(() => ({}));
    return { success: true, messageId: data.messageId || null };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Ett nätverksfel inträffade vid utskicket.' };
  }
}
