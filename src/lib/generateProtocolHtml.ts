import { AppState } from '../types';
import provprotokollLogoImg from '../assets/images/provprotokoll_logo.png';

export function generateOfficialProtocolHtml(state: AppState, inspectorName?: string): string {
  const licenseType = state.properties.licenseType || 'B';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  const isSafetyCheckRequired = [...HEAVY_LICENSES, 'BE'].includes(licenseType);
  const isTaxi = licenseType === 'TAXI';

  const isOmprovSakerhet = state.properties.testType === 'Omprov säkerhetskontroll';
  const isOmprovKorning = state.properties.testType === 'Omprov körning';
  const isOmprovBoth = state.properties.testType === 'Omprov' || state.properties.testType === 'Omprov säkerhetskontroll och körning';

  let isGodkand = false;
  let isFailed = false;

  if (isOmprovSakerhet) {
    if (state.result.safetyCheckResult === 'Godkänt') isGodkand = true;
    if (state.result.safetyCheckResult === 'Underkänt') isFailed = true;
  } else if (isOmprovKorning) {
    if (state.result.drivingResult === 'Godkänt') isGodkand = true;
    if (state.result.drivingResult === 'Underkänt') isFailed = true;
  } else {
    const safetyCheckPassedOrNotNeeded = !isSafetyCheckRequired || state.result.safetyCheckResult === 'Godkänt';
    const drivingPassed = state.result.drivingResult === 'Godkänt';
    isGodkand = drivingPassed && safetyCheckPassedOrNotNeeded;
    isFailed = state.result.drivingResult === 'Underkänt' || (isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt');
  }

  const showSafetyCheckRow = isSafetyCheckRequired && !isOmprovKorning;
  const showDrivingRow = !isOmprovSakerhet;

  let drivingResultText = state.result.drivingResult || '-';
  if (drivingResultText === 'Godkänt') {
    const details: string[] = [];
    if (state.properties.transmission === 'Automat') details.push('Automat');
    if (state.properties.tachograph === 'Utan färdskrivare') details.push('Utan färdskrivare');
    if (details.length > 0) {
      drivingResultText = `Godkänt (${details.join(', ')})`;
    }
  }

  let behorighetText = 'Ingen behörighet uppnådd.';
  const isAssessmentOnly = state.properties.testType?.includes('Testprov') || state.properties.testType?.includes('Bedömningsprov');

  if (isGodkand && state.properties.licenseType && !isAssessmentOnly && !isTaxi) {
    behorighetText = `Behörighet uppnådd: ${state.properties.licenseType}`;
  } else if (isAssessmentOnly || isTaxi) {
    behorighetText = 'Ingen behörighet uppnådd.';
  }

  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;
  const allSituations = Array.from(new Set([
    ...(state.result.drivingResult === 'Underkänt' ? (drivingFail?.situations || []) : []),
    ...(state.result.safetyCheckResult === 'Underkänt' ? (safetyFail?.situations || []) : [])
  ]));

  let testTypeLabel = state.properties.licenseType === 'B96' ? 'Släpvagn' : `Körprov ${state.properties.licenseType || 'B'}`;
  if (state.properties.licenseType === 'B96') {
    if (state.properties.testType?.includes('Omprov säkerhetskontroll och körning')) {
      testTypeLabel = 'Omprov säkerhetskontroll och körning Släpvagn';
    } else if (state.properties.testType?.includes('Omprov säkerhetskontroll')) {
      testTypeLabel = 'Säkerhetskontroll Släpvagn';
    } else if (state.properties.testType?.includes('Omprov körning')) {
      testTypeLabel = 'Omprov körning Släpvagn';
    } else if (state.properties.testType?.includes('Bedömningsprov') || state.properties.testType?.includes('Testprov')) {
      testTypeLabel = 'Bedömningsprov Släpvagn';
    } else {
      testTypeLabel = 'Släpvagn';
    }
  } else if (state.properties.testType?.includes('Bedömningsprov') || state.properties.testType?.includes('Testprov')) {
    testTypeLabel = `Bedömningsprov (${state.properties.licenseType || 'B'})`;
  } else if (state.properties.testType?.includes('Omprov säkerhetskontroll och körning')) {
    testTypeLabel = `Omprov säkerhetskontroll och körning ${state.properties.licenseType || 'B'}`;
  } else if (state.properties.testType?.includes('Omprov säkerhetskontroll')) {
    testTypeLabel = `Säkerhetskontroll ${state.properties.licenseType || 'B'}`;
  } else if (state.properties.testType?.includes('Omprov körning')) {
    testTypeLabel = `Omprov körning ${state.properties.licenseType || 'B'}`;
  }

  const studentName = state.properties.studentName || 'Kandidat';
  const pnr = state.properties.personalNumber || '19820209-4937';
  const testDate = state.properties.testDate || new Date().toISOString().split('T')[0];
  const examiner = inspectorName || state.properties.examiner || 'Hans Eriksson';

  const failureRowsHtml = isFailed
    ? `
      ${!isOmprovSakerhet && state.result.drivingResult === 'Godkänt' ? `<h2 style="color: green; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Din körning är godkänd.</h2>` : ''}
      ${!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' ? `<h2 style="color: red; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Din körning är underkänd.</h2>` : ''}
      ${isSafetyCheckRequired && !isOmprovKorning && state.result.drivingResult !== 'Underkänt' && state.result.safetyCheckResult === 'Underkänt' ? `<h2 style="color: red; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Din säkerhetskontroll är underkänd.</h2>` : ''}
      ${drivingFail?.primaryCause?.area && state.result.drivingResult === 'Underkänt' ? `
        <b>${state.result.safetyCheckResult === 'Underkänt' ? 'Grundorsak till körningens underkännande är:' : 'Grundorsak till underkännandet är:'}</b><br />
        <div style="border: 3px #C0504D solid; margin-bottom: 10px; padding: 5px; margin-top: 5px;">
          <div style="margin-bottom: 10px;">${drivingFail.primaryCause.area}</div>
          Din körning visar brister i att:
          <ul style="margin-top: 0; padding-left: 20px; list-style-type: disc;">
            ${drivingFail.primaryCause.deficiencies.map(d => `<li style="list-style-type: disc;">${d}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${drivingFail?.consequences && drivingFail.consequences.length > 0 && state.result.drivingResult === 'Underkänt' ? `
        <div style="margin-top: 15px;"><b>Detta får konsekvenser på: </b></div>
        ${drivingFail.consequences.map(c => `
          <div style="border: 3px #F79646 solid; margin-bottom: 10px; padding: 5px; margin-top: 5px;">
            <div style="margin-bottom: 10px;">${c.area}</div>
            Din körning visar brister i att:
            <ul style="margin-top: 0; padding-left: 20px; list-style-type: disc;">
              ${c.deficiencies.map(d => `<li style="list-style-type: disc;">${d}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      ` : ''}
      ${isSafetyCheckRequired && safetyFail?.primaryCause?.area && state.result.safetyCheckResult === 'Underkänt' ? `
        <div style="margin-top: 15px;"><b>${state.result.drivingResult === 'Underkänt' ? 'Grundorsak till säkerhetskontrollens underkännande är:' : 'Grundorsak till underkännandet är:'}</b></div>
        <div style="border: 3px #C0504D solid; margin-bottom: 10px; padding: 6px 10px; margin-top: 5px;">
          <div style="margin-bottom: 6px; font-weight: 800; font-size: 14px; color: #111;">${safetyFail.primaryCause.area}</div>
          <ul style="margin-top: 0; padding-left: 20px; list-style-type: disc;">
            ${safetyFail.primaryCause.deficiencies.map(d => `<li style="list-style-type: disc;">${d}</li>`).join('')}
          </ul>
        </div>
        ${safetyFail?.consequences && safetyFail.consequences.length > 0 ? `
          <div style="margin-top: 15px;"><b>Detta får konsekvenser på: </b></div>
          ${safetyFail.consequences.map(c => `
            <div style="border: 3px #F79646 solid; margin-bottom: 10px; padding: 6px 10px; margin-top: 5px;">
              <div style="margin-bottom: 6px; font-weight: 800; font-size: 14px; color: #111;">${c.area}</div>
              <ul style="margin-top: 0; padding-left: 20px; list-style-type: disc;">
                ${c.deficiencies.map(d => `<li style="list-style-type: disc;">${d}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        ` : ''}
      ` : ''}
      ${allSituations.length > 0 ? `
        <div>
          <span><b>Brister har visat sig i följande situationer:</b></span>
          <ul style="margin-top: 4px; padding-left: 18px; list-style-type: disc;">
            ${allSituations.map(s => `<li style="margin-bottom: 2px; font-size: 13px;">${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${state.result.interventionOccurred ? `<div style="margin-top: 10px; margin-bottom: 10px;">Ingripande har förekommit.</div>` : ''}
    `
    : `
      ${!isOmprovSakerhet && state.result.drivingResult === 'Godkänt' ? `<h2 style="color: green; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Din körning är godkänd.</h2>` : ''}
      ${isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' ? `<h2 style="color: green; font-size: 20px; margin: 10px 0; font-weight: bold;">Din säkerhetskontroll är godkänd.</h2>` : ''}
    `;

  const includedItemsHtml = state.includedTestItems && state.includedTestItems.length > 0
    ? `
      <ul style="margin-top: 4px; padding-left: 18px; list-style-type: disc;">
        ${state.includedTestItems.map(i => `<li style="margin-bottom: 2px; font-size: 13px;">${i}</li>`).join('')}
      </ul>
    `
    : `<p style="margin-top: 0; font-style: italic;">Inga specifika moment registrerade.</p>`;

  const taxiLegislationText = 'Detta beslut grundas på taxitrafiklagen (2012:211) och taxitrafikförordningen (2012:238).';
  const standardLegislationText = 'Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.';
  const legislationText = isTaxi ? taxiLegislationText : standardLegislationText;

  const closingHtml = isFailed
    ? (isTaxi 
        ? `<p style="margin-top: 50px;">Du uppfyllde inte kraven för godkänt taxiförarprov enligt taxitrafiklagen (2012:211). Det är viktigt att du tränar mer innan du genomför ditt nästa prov.<br />Välkommen åter!</p>`
        : `<p style="margin-top: 50px;">Det är viktigt att du tränar mer innan du genomför ditt nästa körprov.<br />Välkommen åter!</p>`)
    : `
      <br />
      <span><b>Vad händer nu?</b></span>
      ${isTaxi
        ? `<p style="margin-top: 5px; line-height: 1.5;">Grattis till godkänt taxiförarprov! Du kan nu ansöka om <strong>taxiförarlegitimation</strong> hos Transportstyrelsen enligt taxitrafiklagen (2012:211). Legitimationen utfärdas efter prövning av övriga krav.</p>`
        : isAssessmentOnly 
          ? `<p style="margin-top: 5px; line-height: 1.5;">Grattis till ett godkänt bedömningsprov! Du uppfyller de formella kompetenskraven för körbedömning. Du kan nu bifoga detta intyg för ansökan och behörighetsprövning till <strong>trafiklärarutbildning</strong> samt vidare prövning för <strong>förarprövar- / inspektörsbehörighet</strong>.</p>`
          : `<p style="margin-top: 5px; line-height: 1.5;">Grattis till ditt körkort! Du kan nu köra med en giltig legitimation i Sverige tills du har fått ditt körkort, dock i max två månader.</p>`
      }
    `;

  return `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Resultat från ditt prov - ${studentName}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 20px; background-color: #fff; }
        .resultContainer { width: 100%; max-width: 800px; margin: 0 auto; }
        .infoTable td { padding: 8px 24px 8px 0; vertical-align: top; }
        .resultHeaderLabel { font-size: 12px; font-weight: bold; color: #555; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px; }
        ul { list-style-type: disc !important; padding-left: 20px !important; }
        li { list-style-type: disc !important; }
        @media print {
            body { padding: 0; }
            .print-btn { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="resultContainer">
        <table style="width: 100%; border-collapse: collapse;">
            <tbody>
                <tr>
                    <td style="vertical-align: middle; width: 220px; padding-bottom: 6px;">
                        <img class="logo" src="${provprotokollLogoImg}" alt="ProvProtokoll" style="max-height: 48px; max-width: 200px; object-fit: contain; display: block;" />
                    </td>
                    <td></td>
                    <td style="vertical-align: middle; text-align: right; padding-bottom: 6px;">
                        <div class="print-btn">
                            <a href="javascript:window.print()" style="color: #0066cc; text-decoration: underline; font-size: 13px; font-weight: bold;">Skriv ut</a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="border-top: 1px solid #ddd; padding-top: 20px;">
                        <div style="margin-top: 10px;">
                            <h1 style="font-size: 24px; margin: 0 0 16px 0; font-weight: bold;">Resultat från ditt prov</h1>
                            <table class="infoTable" style="width: 100%; border-collapse: collapse;">
                                <tbody>
                                    <tr>
                                        <td style="width: 50%;">
                                            <div class="resultHeaderLabel">Namn:</div>
                                            <div>${studentName}</div>
                                        </td>
                                        <td style="width: 50%;">
                                            <div class="resultHeaderLabel">Personnummer:</div>
                                            <div>${pnr}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="resultHeaderLabel">Provtyp:</div>
                                            <div>${testTypeLabel}</div>
                                        </td>
                                        <td>
                                            <div class="resultHeaderLabel">Provdatum:</div>
                                            <div>${testDate}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="resultHeaderLabel">Provförrättare:</div>
                                            <div>${examiner}</div>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <br />
        <div>
            <b>Behörighetsinformation</b><br />
            ${behorighetText}
        </div>
        <br />

        <div class="resultBody">
            <table style="border-collapse: collapse; width: 100%;">
                <tbody>
                    <tr style="border-bottom: 1px solid #000;">
                        <td style="padding: 0 50px 8px 0;"><b>Prov</b></td>
                        <td style="padding: 0 0 8px 0;"><b>Resultat</b></td>
                    </tr>
                    ${showDrivingRow ? `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 50px 8px 0;">Körning</td>
                        <td style="padding: 8px 0;">${drivingResultText}</td>
                    </tr>` : ''}
                    ${showSafetyCheckRow ? `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 50px 8px 0;">Säkerhetskontroll</td>
                        <td style="padding: 8px 0;">${!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' ? '-' : (state.result.safetyCheckResult || '-')}</td>
                    </tr>` : ''}
                </tbody>
            </table>

            <br />
            <div>
                ${legislationText}<br />
                Här ser du ditt resultat inom provets olika ämnesområden.
            </div>
            <br />

            ${failureRowsHtml}

            <br />
            <span><b>Följande provinnehåll har ingått i ditt körprov:</b></span>
            ${includedItemsHtml}

            ${closingHtml}
        </div>
    </div>
</body>
</html>`;
}

// Mejlklienter kan inte läsa Vites internt bundlade bild-URL:er, så logotypen
// måste peka på en absolut, publikt nåbar adress i mejlversionen.
const EMAIL_LOGO_URL = 'https://protokoll.rasmusl.se/provprotokoll_logo.png';

export function generateEmailProtocolHtml(state: AppState, inspectorName?: string): string {
  const studentName = state.properties.studentName || 'Förnamn Efternamn';
  const protocolHtml = generateOfficialProtocolHtml(state, inspectorName);
  const styleMatch = protocolHtml.match(/<style>[\s\S]*?<\/style>/);
  const styleTag = styleMatch ? styleMatch[0] : '';
  const bodyContent = protocolHtml
    .replace(/^[\s\S]*<body>/, '')
    .replace(/<\/body>[\s\S]*$/, '')
    .replace(/src="[^"]*"(\s+alt="ProvProtokoll")/, `src="${EMAIL_LOGO_URL}"$1`);

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <title>Resultat från ditt prov - ${studentName}</title>
  ${styleTag}
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:800px;margin:0 auto;padding:28px 24px;background-color:#ffffff;">
    <p style="margin:0 0 12px 0;font-size:14px;color:#111;">Hej!</p>
    <p style="margin:0 0 12px 0;font-size:14px;color:#111;line-height:1.5;">Du har nyligen gjort körprov hos oss. Resultatet kan du läsa nedan.</p>
    <p style="margin:0 0 24px 0;font-size:13px;color:#555;line-height:1.4;">Vänliga hälsningar,<br />ProvProtokoll</p>
    <hr style="margin:0 0 28px 0;border:none;border-top:1px solid #e2e8f0;" />
    ${bodyContent}
  </div>
</body>
</html>`;
}

export function downloadProtocolHtml(state: AppState, inspectorName?: string) {
  const html = generateOfficialProtocolHtml(state, inspectorName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `Korprovsresultat_${(state.properties.studentName || 'Kandidat').replace(/\s+/g, '_')}_${state.properties.licenseType || 'B'}.html`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadEmailProtocolHtml(state: AppState, inspectorName?: string) {
  const html = generateEmailProtocolHtml(state, inspectorName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `Mejlprotokoll_${(state.properties.studentName || 'Kandidat').replace(/\s+/g, '_')}_${state.properties.licenseType || 'B'}.html`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
