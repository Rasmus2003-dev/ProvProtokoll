import { AppState } from '../types';
import provprotokollLogoImg from '../assets/images/provprotokoll_logo.png';
import { ABORTED_TEXT, ABORTED_TITLE, abortedDrivingText, collectImprovementAreas, failedSituations, formatResultHeadingHtml, isNewLayout, resultHeadings, resultTranslationLines, translationUrl } from './protocolLayout';

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

  // Ett avbrutet prov är aldrig godkänt – samma bedömning som i resultatvyn
  const isAborted = Boolean(state.result.testAborted);
  if (isAborted) {
    isFailed = true;
    isGodkand = false;
  }

  const showSafetyCheckRow = isSafetyCheckRequired && !isOmprovKorning;
  const showDrivingRow = !isOmprovSakerhet;

  let drivingResultText = state.result.drivingResult || '-';
  if (isAborted) {
    drivingResultText = abortedDrivingText(state.result.drivingResult);
  } else if (drivingResultText === 'Godkänt') {
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
  const allSituations = failedSituations(state);
  const interventionSituations = state.result.interventionSituations || [];

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

  // Grundorsaker (körning + säkerhetskontroll) slås ihop till EN enda
  // sammanhängande text under en gemensam rubrik, utan att särskilja vilket
  // delprov (körning/säkerhetskontroll) som orsakade det - bara kompetens-
  // området och de markerade bristerna ska synas. Om samma område valts för
  // båda delproven slås bristerna ihop under en enda rubrik för det området.
  const primaryCauseAreas = new Map<string, Set<string>>();
  const addPrimaryCause = (area: string, deficiencies: string[]) => {
    if (!primaryCauseAreas.has(area)) primaryCauseAreas.set(area, new Set());
    deficiencies.forEach(d => primaryCauseAreas.get(area)!.add(d));
  };
  if (drivingFail?.primaryCause?.area && state.result.drivingResult === 'Underkänt') {
    addPrimaryCause(drivingFail.primaryCause.area, drivingFail.primaryCause.deficiencies);
  }
  if (isSafetyCheckRequired && safetyFail?.primaryCause?.area && state.result.safetyCheckResult === 'Underkänt') {
    addPrimaryCause(safetyFail.primaryCause.area, safetyFail.primaryCause.deficiencies);
  }
  const primaryCauseEntries = Array.from(primaryCauseAreas.entries()).map(([area, deficiencies]) => ({
    area,
    deficiencies: Array.from(deficiencies)
  }));

  const allConsequences = [
    ...(state.result.drivingResult === 'Underkänt' ? (drivingFail?.consequences || []) : []),
    ...(isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt' ? (safetyFail?.consequences || []) : [])
  ];

  const newLayout = isNewLayout(state);
  const listHtml = (items: string[]) => `
      <ul style="margin-top: 4px; padding-left: 18px; list-style-type: disc;">
        ${items.map(s => `<li style="margin-bottom: 2px;">${s}</li>`).join('')}
      </ul>`;

  // Trafikverkets nya utformning: alla kompetensområden i en ram under
  // "Du måste bli bättre på:" med bristerna som underpunkter
  const improvementAreas = collectImprovementAreas(state);
  const newFailureRowsHtml = `
      ${resultHeadings(state).map(h => `<h2 style="color: ${h.passed ? 'green' : 'red'}; font-size: 13.5pt; line-height: 1.35; margin: 0 0 12px 0; word-break: normal;">${formatResultHeadingHtml(h.text)}</h2>`).join('')}
      ${improvementAreas.length > 0 ? `
        <b>Orsaker till underkännandet:</b>
        <div style="border: 3px solid #000; padding: 8px 14px 4px; margin: 6px 0 18px;">
          <b>Du måste bli bättre på:</b>
          <ul style="margin: 4px 0 10px; padding-left: 28px; list-style-type: disc;">
            ${improvementAreas.map(entry => `
              <li style="margin-bottom: 4px;">${entry.area}
                ${entry.deficiencies.map(d => `<div style="padding-left: 48px;">- ${d}</div>`).join('')}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${allSituations.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <b>Du har visat brister i dessa situationer:</b>
          ${listHtml(allSituations)}
        </div>
      ` : ''}
      ${state.result.interventionOccurred ? (interventionSituations.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <b>Ingripande har skett i följande situationer:</b>
          ${listHtml(interventionSituations)}
        </div>
      ` : `<div style="margin-bottom: 14px;">Ingripande har förekommit.</div>`) : ''}
    `;

  const failureRowsHtml = newLayout
    ? newFailureRowsHtml
    : isFailed
    ? `
      ${!isOmprovSakerhet && !isAborted && state.result.drivingResult === 'Godkänt' ? `<h2 style="color: green; font-size: 13.5pt; line-height: 1.35; margin: 0 0 12px 0; word-break: normal;">${formatResultHeadingHtml('Din körning är godkänd.')}</h2>` : ''}
      ${!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' ? `<h2 style="color: red; font-size: 13.5pt; line-height: 1.35; margin: 0 0 12px 0; word-break: normal;">${formatResultHeadingHtml('Din körning är underkänd.')}</h2>` : ''}
      ${isSafetyCheckRequired && !isOmprovKorning && state.result.drivingResult !== 'Underkänt' && state.result.safetyCheckResult === 'Underkänt' ? `<h2 style="color: red; font-size: 13.5pt; line-height: 1.35; margin: 0 0 12px 0; word-break: normal;">${formatResultHeadingHtml('Din säkerhetskontroll är underkänd.')}</h2>` : ''}
      ${primaryCauseEntries.length > 0 ? `
        <b>Grundorsak till underkännandet är:</b><br />
        <div style="border: 3px #C0504D solid; margin-bottom: 10px; padding: 5px 10px; margin-top: 5px;">
          ${primaryCauseEntries.map((entry, idx) => `
            <div style="${idx > 0 ? 'margin-top: 12px; padding-top: 10px; border-top: 1px solid #e8cac9;' : ''}">
              <div style="margin-bottom: 8px;">${entry.area}</div>
              Visar brister i att:
              <ul style="margin-top: 0; padding-left: 20px; list-style-type: disc;">
                ${entry.deficiencies.map(d => `<li style="list-style-type: disc;">${d}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${allConsequences.length > 0 ? `
        <div style="margin-top: 15px;"><b>Detta får konsekvenser på: </b></div>
        ${allConsequences.map(c => `
          <div style="border: 3px #F79646 solid; margin-bottom: 10px; padding: 5px; margin-top: 5px;">
            <div style="margin-bottom: 10px;">${c.area}</div>
            Visar brister i att:
            <ul style="margin-top: 0; padding-left: 20px; list-style-type: disc;">
              ${c.deficiencies.map(d => `<li style="list-style-type: disc;">${d}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      ` : ''}
      ${allSituations.length > 0 ? `
        <div>
          <span><b>Brister har visat sig i följande situationer:</b></span>
          <ul style="margin-top: 4px; padding-left: 18px; list-style-type: disc;">
            ${allSituations.map(s => `<li style="margin-bottom: 2px; font-size: 13px;">${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${state.result.interventionOccurred ? (interventionSituations.length > 0 ? `
        <div style="margin-top: 10px;">
          <span><b>Ingripande har skett i följande situationer:</b></span>
          <ul style="margin-top: 4px; padding-left: 18px; list-style-type: disc;">
            ${interventionSituations.map(s => `<li style="margin-bottom: 2px; font-size: 13px;">${s}</li>`).join('')}
          </ul>
        </div>
      ` : `<div style="margin-top: 10px; margin-bottom: 10px;">Ingripande har förekommit.</div>`) : ''}
    `
    : `
      ${!isOmprovSakerhet && state.result.drivingResult === 'Godkänt' ? `<h2 style="color: green; font-size: 13.5pt; line-height: 1.35; margin: 0 0 12px 0; word-break: normal;">${formatResultHeadingHtml('Din körning är godkänd.')}</h2>` : ''}
      ${isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' ? `<h2 style="color: green; font-size: 13.5pt; line-height: 1.35; margin: 0 0 12px 0; word-break: normal;">${formatResultHeadingHtml('Din säkerhetskontroll är godkänd.')}</h2>` : ''}
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

  // Ny layout: hela resultatet, inklusive alla orsaker, kan översättas (som hos Trafikverket)
  const htmlToLines = (html: string) => html
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '')
    .split('\n').map(l => l.trim()).filter(Boolean);
  const translateHref = translationUrl(resultTranslationLines(
    state,
    [legislationText, 'Här ser du ditt resultat inom provets olika ämnesområden.'],
    htmlToLines(closingHtml),
  )).replace(/&/g, '&amp;');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Körprovsresultat - ${studentName}</title>
    <style>
        body { font-family: Arial, Sans-Serif; }
        .resultContainer { font-family: Arial, sans-serif; font-size: 11pt; max-width: 730px; color: #000; }
        .resultContainer h1 { font-size: 18pt; margin: 0; }
        .resultContainer h2 { font-size: 13.5pt; line-height: 1.35; margin: 0 0 12px 0; word-break: normal; overflow-wrap: normal; }
        .resultContainer h3 { font-size: 12pt; margin: 0; }
        .resultContainer .resultHeaderLabel { font-size: 8pt; font-weight: bold; }
        .resultContainer .infoTable td { padding-right: 20px; padding-bottom: 10px; vertical-align: top; }
        .resultContainer .resultTable td { padding: 3px; }
        @media print {
            .resultContainer .print-btn { display: none; visibility: hidden; }
            .translate { display: none; visibility: hidden; }
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
                        <h1>Körprovsresultat</h1>
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
                    ${!newLayout && !isOmprovSakerhet && state.result.drivingResult === 'Underkänt' ? '-' : (state.result.safetyCheckResult || '-')}
                </td>
            </tr>` : ''}
        </table>
        <br />
        <div>
            ${legislationText}<br />
            Här ser du ditt resultat inom provets olika ämnesområden.
        </div>
        <br />

        ${isAborted ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 0 0 18px;">
            <tr>
                <td style="border-left: 4px solid #c40000; background: #fdf1f1; padding: 10px 14px;">
                    <b style="color: #a00000;">${ABORTED_TITLE}</b><br />
                    ${ABORTED_TEXT}
                </td>
            </tr>
        </table>` : ''}

        ${failureRowsHtml}

        <span><b>${newLayout ? 'Detta bedömdes i ditt körprov:' : 'Följande provinnehåll har ingått i ditt körprov:'}</b></span>
        ${includedItemsHtml}

        ${closingHtml}

        ${newLayout ? `
        <div class="translate" style="margin-top: 36px;">
            <a href="${translateHref}" target="_blank" rel="noopener" style="color: #0066cc; text-decoration: underline;">Translation</a>
        </div>` : ''}
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
    .replace(/src="[^"]*"(\s+alt="ProvProtokoll")/, `src="${EMAIL_LOGO_URL}"$1`)
    .replace(/max-width:\s*195px;\s*max-height:\s*52px;/, 'max-width: 210px; max-height: 62px;');

  const noReplyBanner = `
    <div style="background: #f7f9fc; border: 1px solid #dde3ea; border-left: 3px solid #99a6b8; border-radius: 4px; padding: 12px 16px; margin-bottom: 22px; font-size: 10pt; color: #555; line-height: 1.5;">
      <strong>Svara ej – detta mejl går inte att besvara.</strong>
    </div>`;

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Körprovsresultat - ${studentName}</title>
  ${styleTag}
  <style>
    body { line-height: 1.6; background-color: #f7f9fa; margin: 0; padding: 16px 8px; font-family: Arial, Helvetica, sans-serif; }
    .email-container { max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; }
    .email-card { padding: 24px 22px 28px 22px; }
    .resultContainer { max-width: 100% !important; }
    .resultContainer table.infoTable td { padding-bottom: 12px; }
    .resultContainer table.resultTable { margin-top: 4px; }
    .resultContainer h2 { font-size: 13.5pt; line-height: 1.35; margin: 0 0 12px 0; word-break: normal; }
    @media only screen and (max-width: 600px) {
      .email-card { padding: 16px 12px 20px 12px !important; }
      .resultContainer h2 { font-size: 12.5pt !important; }
    }
  </style>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 16px 8px; background-color: #f7f9fa; color: #1e293b; -webkit-text-size-adjust: 100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
    <tr>
      <td class="email-card" style="padding: 24px 22px 28px 22px;">
        ${noReplyBanner}
        <div style="font-size: 11pt; line-height: 1.6; color: #2d3748; margin-bottom: 16px;">
          Hej ${studentName}!<br /><br />
          Här kommer ditt resultat från ditt körprov.<br /><br />
          Vänliga hälsningar,<br />
          <strong>ProvProtokoll</strong>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 18px 0;" />
        ${bodyContent}
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 12px;" />
        <p style="font-size: 8.5pt; color: #718096; margin: 0; line-height: 1.5;">
          Svara ej – detta är ett automatiskt genererat mejl som inte kan besvaras.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Öppnar det officiella protokollet i ett nytt fönster och triggar
 * webbläsarens utskriftsdialog direkt. Använder exakt samma HTML-källa
 * (generateOfficialProtocolHtml) som PDF-nedladdningen och mejlet, så
 * "Skriv ut" garanterat visar identisk layout - inte en separat manuellt
 * uppbyggd version som kan hamna i otakt.
 */
export function printProtocol(state: AppState, inspectorName?: string) {
  const html = generateOfficialProtocolHtml(state, inspectorName);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
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
