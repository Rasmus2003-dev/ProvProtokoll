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
      ${!isOmprovSakerhet && state.result.drivingResult === 'Godkänt' ? `<h2 style="color: green;">Din körning är godkänd.</h2>` : ''}
      ${!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' ? `<h2 style="color: red;">Din körning är underkänd.</h2>` : ''}
      ${isSafetyCheckRequired && !isOmprovKorning && state.result.drivingResult !== 'Underkänt' && state.result.safetyCheckResult === 'Underkänt' ? `<h2 style="color: red;">Din säkerhetskontroll är underkänd.</h2>` : ''}
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
      ${!isOmprovSakerhet && state.result.drivingResult === 'Godkänt' ? `<h2 style="color: green;">Din körning är godkänd.</h2>` : ''}
      ${isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' ? `<h2 style="color: green;">Din säkerhetskontroll är godkänd.</h2>` : ''}
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
        body { font-family: Arial, Sans-Serif; }
        .resultContainer { font-family: Arial, sans-serif; font-size: 11pt; max-width: 730px; color: #000; }
        .resultContainer h1 { font-size: 18pt; margin: 0; }
        .resultContainer h2 { font-size: 14pt; }
        .resultContainer h3 { font-size: 12pt; margin: 0; }
        .resultContainer .resultHeaderLabel { font-size: 8pt; font-weight: bold; }
        .resultContainer .infoTable td { padding-right: 20px; padding-bottom: 10px; vertical-align: top; }
        .resultContainer .resultTable td { padding: 3px; }
        @media print {
            .resultContainer .print-btn { display: none; visibility: hidden; }
        }
        @media screen and (max-width: 735px) {
            .resultContainer .print-btn { display: none; visibility: hidden; }
        }
    </style>
</head>
<body>
    <div class="resultContainer">
        <table style="width:100%">
            <tr>
                <td width="195" style="vertical-align: top; width: 195px">
                    <img class="logo" src="${provprotokollLogoImg}" alt="ProvProtokoll" style="max-width: 195px; max-height: 52px; object-fit: contain;" />
                </td>
                <td></td>
                <td style="vertical-align: top; text-align: right;">
                    <div class="print-btn">
                        <a href="javascript:window.print()" style="color: #0066cc; text-decoration: underline; font-size: 9pt;">Skriv ut</a>
                    </div>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <div style="margin-top: 30px;">
                        <h1>Resultat från ditt prov</h1>
                        <table class="infoTable">
                            <tr>
                                <td>
                                    <div class="resultHeaderLabel">Namn:</div>
                                    ${studentName}
                                </td>
                                <td>
                                    <div class="resultHeaderLabel">Personnummer:</div>
                                    ${pnr}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="resultHeaderLabel">Provtyp:</div>
                                    ${testTypeLabel}
                                </td>
                                <td>
                                    <div class="resultHeaderLabel">Provdatum:</div>
                                    ${testDate}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="resultHeaderLabel">Provförrättare:</div>
                                    ${examiner}
                                </td>
                                <td></td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>
    </div>
    <br />
    <div>
        <b>Behörighetsinformation</b><br />
        ${behorighetText}
    </div>
    <br />

    <div class="resultBody">
        <table class="resultTable">
            <tr>
                <td>
                    <b>Prov</b>
                </td>
                <td>
                    <b>Resultat</b>
                </td>
            </tr>
            ${showDrivingRow ? `
            <tr>
                <td style="padding-right: 50px;">
                    Körning
                </td>
                <td>
                    ${drivingResultText}
                </td>
            </tr>` : ''}
            ${showSafetyCheckRow ? `
            <tr>
                <td style="padding-right: 50px;">
                    Säkerhetskontroll
                </td>
                <td>
                    ${!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' ? '-' : (state.result.safetyCheckResult || '-')}
                </td>
            </tr>` : ''}
        </table>
        <br />
        <div>
            ${legislationText}<br />
            Här ser du ditt resultat inom provets olika ämnesområden.
        </div>
        <br />

        ${failureRowsHtml}

        <span><b>Följande provinnehåll har ingått i ditt körprov:</b></span>
        ${includedItemsHtml}

        ${closingHtml}
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

  const noReplyBanner = `
    <div style="background: #f2f4f7; border: 1px solid #d8dde3; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 10pt; color: #555;">
      <strong>OBS: Detta mejl går inte att besvara (Do not reply).</strong><br />
      Svar till denna adress läses inte. Vid frågor om ditt provresultat, kontakta din provförrättare eller Trafikverket direkt.
    </div>`;

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <title>Resultat från ditt prov - ${studentName}</title>
  ${styleTag}
</head>
<body style="font-family: Arial, Sans-Serif;">
    ${noReplyBanner}
    Hej!<br />
    <br />
    Du har nyligen gjort körprov hos oss. Resultatet kan du läsa nedan.<br />
    <br />
    Vänliga hälsningar,<br />
    ProvProtokoll<br />
    <br />
    <hr />
    <br />
    ${bodyContent}
    <br />
    <hr />
    <p style="font-size: 9pt; color: #888;">
      Detta är ett automatiskt genererat mejl som inte kan besvaras. Kontakta din provförrättare eller Trafikverket om du har frågor om resultatet.
    </p>
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
