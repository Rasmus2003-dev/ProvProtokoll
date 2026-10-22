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
    label: 'Eget meddelande',
    description: 'Skriv fritt – mejlet får samma layout som övriga utskick',
    defaultSubject: 'Meddelande om ditt förarprov',
  },
  {
    id: 'kallelse',
    label: 'Kallelse',
    description: 'Tid, plats och vad kandidaten ska ta med',
    defaultSubject: 'Kallelse till körprov',
  },
  {
    id: 'paminnelse',
    label: 'Påminnelse',
    description: 'Skickas dagen innan med några saker att komma ihåg',
    defaultSubject: 'Påminnelse om ditt körprov',
  },
  {
    id: 'trafikskola',
    label: 'Rapport till trafikskola',
    description: 'Kort sammanfattning till elevens trafikskola',
    defaultSubject: 'Sammanfattning av körprov',
  },
  {
    id: 'intyg',
    label: 'Intyg',
    description: 'Intyg om genomfört prov, till exempel till arbetsgivare',
    defaultSubject: 'Intyg om genomfört förarprov',
  },
];

// Mejlklienter kan inte läsa appens inbyggda bilder – logotypen måste ligga på en publik adress
const LOGO_URL = 'https://protokoll.rasmusl.se/provprotokoll_logo_trim.png';

const INK = '#0f1b2d';
const TEXT = '#334155';
const MUTED = '#64748b';
const LINE = '#e3e8ef';
const NAVY = '#002f6c';

/** Skyddar text som skrivits in i appen från att tolkas som HTML */
function esc(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Fritext till stycken: tom rad = nytt stycke, radbrytning = <br> */
function paragraphs(text: string): string {
  return esc(text)
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin: 0 0 14px 0;">${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

/** Uppgiftsruta med etikett och värde per rad */
function details(rows: [string, string][]): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; background: #f6f8fb; border: 1px solid ${LINE}; border-radius: 10px;">
      <tr><td style="padding: 14px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
          ${rows.map(([label, value]) => `
          <tr>
            <td style="padding: 5px 16px 5px 0; color: ${MUTED}; width: 120px; vertical-align: top;">${esc(label)}</td>
            <td style="padding: 5px 0; color: ${INK}; font-weight: 600; vertical-align: top;">${value}</td>
          </tr>`).join('')}
        </table>
      </td></tr>
    </table>`;
}

function list(items: string[]): string {
  return `<ul style="margin: 0 0 18px 0; padding-left: 20px;">${items.map(i => `<li style="margin: 0 0 6px 0;">${i}</li>`).join('')}</ul>`;
}

function signature(name: string, closing = 'Vänliga hälsningar'): string {
  return `
    <p style="margin: 24px 0 0 0;">${closing},</p>
    <p style="margin: 2px 0 0 0; font-weight: 700; color: ${INK};">${esc(name)}</p>
    <p style="margin: 0; font-size: 13px; color: ${MUTED};">Förarprov</p>`;
}

/**
 * Gemensam layout för alla utskick som inte är provprotokoll:
 * logotyp, ett vitt kort med rubrik och innehåll, och en diskret sidfot.
 */
export function emailLayout(opts: { eyebrow: string; title: string; body: string; preheader?: string }): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${esc(opts.title)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .pp-card { padding: 24px 20px !important; }
      .pp-title { font-size: 21px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: #f3f5f8; font-family: Arial, Helvetica, sans-serif; color: ${TEXT}; -webkit-text-size-adjust: 100%;">
  ${opts.preheader ? `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${esc(opts.preheader)}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f3f5f8;">
    <tr>
      <td align="center" style="padding: 28px 12px 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          <tr>
            <td style="padding: 0 4px 16px;">
              <img src="${LOGO_URL}" alt="ProvProtokoll" height="44" style="display: block; height: 44px; width: auto; border: 0;" />
            </td>
          </tr>
          <tr>
            <td class="pp-card" style="background: #ffffff; border: 1px solid ${LINE}; border-radius: 14px; padding: 32px 36px; font-size: 15px; line-height: 1.65; color: ${TEXT};">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: ${NAVY};">${esc(opts.eyebrow)}</p>
              <h1 class="pp-title" style="margin: 0 0 20px 0; font-size: 24px; line-height: 1.25; font-weight: 700; color: ${INK};">${esc(opts.title)}</h1>
              ${opts.body}
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 8px 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
              Skickat från ProvProtokoll. Har du frågor går det bra att svara direkt på det här mejlet.
            </td>
          </tr>
        </table>
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
    testDate = new Date().toLocaleDateString('sv-SE'),
    bookingTime = '09:00',
    location = 'Förarprovskontoret',
    examiner = 'Förarprövaren',
    schoolName = 'Trafikskolan',
    result = 'Godkänt',
    customSubject,
    customMessage,
  } = params;

  const first = esc((toName || '').trim().split(/\s+/)[0] || 'där');
  const lic = esc(licenseType);
  const passed = result === 'Godkänt';

  if (templateType === 'kallelse') {
    const subject = `Kallelse till körprov ${licenseType} – ${testDate}`;
    const body = `
      <p style="margin: 0 0 14px 0;">Hej ${first}!</p>
      <p style="margin: 0 0 14px 0;">Välkommen till ditt körprov för behörighet ${lic}. Här är det du behöver veta.</p>
      ${details([
        ['Datum', esc(testDate)],
        ['Tid', `${esc(bookingTime)} <span style="font-weight: 400; color: ${MUTED};">– kom gärna 15 minuter innan</span>`],
        ['Plats', esc(location)],
        ['Behörighet', lic],
      ])}
      <p style="margin: 0 0 8px 0; font-weight: 700; color: ${INK};">Ta med dig</p>
      ${list([
        'Giltig legitimation – körkort, pass eller nationellt id-kort. Utan den kan provet inte genomföras.',
        'Glasögon eller linser om du har villkor för det.',
        `Ett fordon som uppfyller kraven för ${lic}, om du inte kör trafikskolans.`,
      ])}
      <p style="margin: 0;">Lycka till – vi ses!</p>
      ${signature(examiner)}`;
    return { subject, html: emailLayout({ eyebrow: 'Kallelse', title: `Körprov ${licenseType}`, body, preheader: `${testDate} kl. ${bookingTime}, ${location}` }) };
  }

  if (templateType === 'paminnelse') {
    const subject = `Påminnelse: körprov ${licenseType} ${testDate}`;
    const body = `
      <p style="margin: 0 0 14px 0;">Hej ${first}!</p>
      <p style="margin: 0 0 14px 0;">En liten påminnelse om att ditt körprov närmar sig.</p>
      ${details([
        ['Datum', esc(testDate)],
        ['Tid', esc(bookingTime)],
        ['Plats', esc(location)],
      ])}
      <p style="margin: 0 0 8px 0; font-weight: 700; color: ${INK};">Kom ihåg</p>
      ${list([
        'Legitimationen – körkort, pass eller nationellt id-kort.',
        'Var på plats i god tid, gärna 15 minuter innan.',
        'Sov gott och ät ordentligt innan. Det gör skillnad.',
      ])}
      <p style="margin: 0;">Välkommen!</p>
      ${signature(examiner)}`;
    return { subject, html: emailLayout({ eyebrow: 'Påminnelse', title: 'Snart är det dags', body, preheader: `Ditt körprov ${testDate} kl. ${bookingTime}` }) };
  }

  if (templateType === 'trafikskola') {
    const subject = `Körprov ${licenseType} för ${toName} – ${result}`;
    const body = `
      <p style="margin: 0 0 14px 0;">Hej ${esc(schoolName)}!</p>
      <p style="margin: 0 0 14px 0;">Här kommer en kort sammanfattning av körprovet för er elev ${esc(toName)}.</p>
      ${details([
        ['Elev', esc(toName)],
        ['Behörighet', lic],
        ['Datum', esc(testDate)],
        ['Resultat', `<span style="color: ${passed ? '#047857' : '#b91c1c'};">${esc(result)}</span>`],
        ['Förarprövare', esc(examiner)],
      ])}
      ${customMessage ? `
        <p style="margin: 0 0 8px 0; font-weight: 700; color: ${INK};">Mina kommentarer</p>
        <div style="margin: 0 0 14px 0; padding-left: 14px; border-left: 3px solid ${LINE};">${paragraphs(customMessage)}</div>` : ''}
      <p style="margin: 0; color: ${MUTED}; font-size: 14px;">Eleven har fått sitt protokoll direkt från oss.</p>
      ${signature(examiner)}`;
    return { subject, html: emailLayout({ eyebrow: 'Till trafikskolan', title: `Körprov ${licenseType} – ${result.toLowerCase()}`, body }) };
  }

  if (templateType === 'intyg') {
    const subject = `Intyg om genomfört förarprov – ${toName}`;
    const issued = new Date().toLocaleDateString('sv-SE');
    const body = `
      <p style="margin: 0 0 14px 0;">Härmed intygas att nedanstående person har genomfört förarprov.</p>
      ${details([
        ['Namn', esc(toName)],
        ['Behörighet', lic],
        ['Provdatum', esc(testDate)],
        ['Resultat', `<span style="color: ${passed ? '#047857' : '#b91c1c'};">${esc(result)}</span>`],
        ['Förarprövare', esc(examiner)],
      ])}
      ${customMessage ? paragraphs(customMessage) : ''}
      <p style="margin: 0; font-size: 13px; color: ${MUTED};">Utfärdat ${issued}.</p>
      ${signature(examiner, 'Med vänlig hälsning')}`;
    return { subject, html: emailLayout({ eyebrow: 'Intyg', title: 'Intyg om genomfört förarprov', body }) };
  }

  // Eget meddelande
  const subject = customSubject || 'Meddelande om ditt förarprov';
  const body = `
    <p style="margin: 0 0 14px 0;">Hej ${first}!</p>
    ${paragraphs(customMessage || 'Jag har ett meddelande om ditt förarprov.')}
    ${signature(examiner)}`;
  return { subject, html: emailLayout({ eyebrow: 'Meddelande', title: subject, body }) };
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
