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

  // Authentic Trafikverket SVG data URL
  const TRAFIKVERKET_LOGO_SVG = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgdmlld0JveD0iMCAwIDE5NSA0OS4wMDAwMDEiCiAgIGhlaWdodD0iNDkiCiAgIHdpZHRoPSIxOTUiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIGlkPSJzdmcyIgogICB2ZXJzaW9uPSIxLjEiCiAgIHNvZGlwb2RpOmRvY25hbWU9ImxvZ28xOTUuc3ZnIgogICBpbmtzY2FwZTpleHBvcnQtZmlsZW5hbWU9IkM6XHNsYXNrXGxvZ29cUmVwb3J0c1xsb2dvMzgucG5nIgogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNTI2NjIxMzksMCwwLC0wLjUyNjYyMTM5LDAsNDguNjE5MDg3KSI+CiAgICA8ZyB0cmFuc2Zvcm09InNjYWxlKDAuMSkiPgogICAgICA8cGF0aCBzdHlsZT0iZmlsbDojZGQxZDI1O2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIiBkPSJNIDMyMC40NTMsMC4wMDM5MDYyNSBDIDUyNS43ODUsMC4wMDM5MDYyNSA2MTguOTIyLDE1MS42MzMgNjI0LjkzNCwxOTYuNjYgNTkxLjUyNywxNDguMzU5IDQ2NC42NjgsNzUuMzU1NSAzMjAuNDUzLDc1LjM1NTUgMTc2LjI1NCw3NS4zNTU1IDQ5LjQxMDIsMTQ4LjM1OSAxNS45NDUzLDE5Ni42NiAyMS45ODgzLDE1MS42MzMgMTE1LjEyMSwwLjAwMzkwNjI1IDMyMC40NTMsMC4wMDM5MDYyNSIgLz4KICAgICAgPHBhdGggc3R5bGU9ImZpbGw6I2RkMWQyNTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgZD0ibSAzMjAuNDUzLDg5NS4yMTEgYyAtNC4yNDYsMCAtNy44MjQsLTMuNDg4IC03LjgyNCwtNy44MDEgMCwtNC4zMzIgMy41NzgsLTcuODc1IDcuODI0LC03Ljg3NSA0LjMzNiwwIDcuOTEsMy41NDMgNy45MSw3Ljg3NSAwLDQuMzEzIC0zLjU3NCw3LjgwMSAtNy45MSw3LjgwMSIgLz4KICAgICAgPHBhdGggc3R5bGU9ImZpbGw6I2RkMWQyNTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgZD0ibSAzNjQuMTg0LDc3MS4xMzcgYyAwLDEuNDE0IDIuMzQzLDMuMDM5IDQuNTYyLDMuMDM5IDUwLjM2MywtMjEuMTYgOTYuMDA0LC01Ny4xNDUgMTI2LjA2MywtOTMuMjM1IDIwLjI0NiwtMjQuMjg5IDMyLjc1NCwtNTQuNjE3IDI3LjcwMywtODEuMzc4IC00LjIyNywtMjIuMzkxIC0yMy45NzMsLTM4LjE0MSAtNDYuMzYsLTM0Ljk5MyAtMjIuNTgyLDMuMTI1IC0zNy42MDUsMjMuODAxIC0zNC45MzcsNDYuNDAzIDIuNjk1LDIzLjc4NSAyNi40MDYsMzMuOTggMjYuNDA2LDMzLjk4IC0xNi42Niw2My4wOSAtNjEuNTYyLDEwMy45ODEgLTEwMy40MzcsMTI2LjE4NCIgLz4KICAgICAgPHBhdGggc3R5bGU9ImZpbGw6I2RkMWQyNTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgZD0ibSAyNzYuNzAzLDc3MS4xMzcgYyAwLDEuNDE0IC0yLjM0NCwzLjAzOSAtNC41NTgsMy4wMzkgLTUwLjM3MiwtMjEuMTYgLTk2LjAwOCwtNTcuMTQ1IC0xMjYuMDY3LC05My4yMzUgLTIwLjIzOCwtMjQuMjg5IC0zMi43NTgsLTU0LjYxNyAtMjcuNzAzLC04MS4zNzggNC4yMjcsLTIyLjM5MSAyMy45NjksLTM4LjE0MSA0Ni4zNTksLTM0Ljk5MyAyMi41ODYsMy4xMjUgMzcuNjA2LDIzLjgwMSAzNC45MzgsNDYuNDAzIC0yLjY5NSwyMy43ODUgLTI2LjQwNiwzMy45OCAtMjYuNDA2LDMzLjk4IDE2LjY1Niw2My4wOSA2MS41NTgsMTAzLjk4MSAxMDMuNDM3LDEyNi4xODQiIC8+CiAgICAgIDxwYXRoIHN0eWxlPSJmaWxsOiNkZDFkMjU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIGQ9Im0gMzE1LjM1Miw3NTkuNTY2IGMgLTEyLjcwNywtNDAuMjc3IC0zNi43OTcsLTEyMS41NzggLTM2Ljc5NywtMTQ2LjIxNCAwLC0yNC42NTMgMTcuMjYxLC00NC42MzMgNDEuODk4LC00NC42MzMgMjQuNjQxLDAgNDEuOTE4LDE5Ljk4IDQxLjkxOCw0NC42MzMgMCwyNC42MzYgLTI0LjEwOSwxMDUuOTM3IC0zNi44MjgsMTQ2LjIxNCAtMi4zMTMsMS43MDcgLTcuNTUxLDEuNzA3IC0xMC4xOTEsMCIgLz4KICAgICAgPHBhdGggc3R5bGU9ImZpbGw6I2RkMWQyNTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgZD0ibSAzNzguNTU1LDQzNi4xMzcgYyAzMC43OTMsMCAxMzUuMjY5LC0zLjEyNSAxMzUuMjY5LC0zLjEyNSAzNy4zNzUsMTEuMzM2IDU2LjM2NCwzNy40MjIgNjIuNTM5LDg0LjUyMyAwLDAgLTExOS42OTksNS41NTkgLTI1NS45MSw1LjU1OSAtMTM2LjIxMSwwIC0yNTQuODQzNiwtNS41NTkgLTI1NC44NDM2LC01LjU1OSA2LjEyNSwtNDcuMTAxIDI1LjEyODksLTczLjE4NyA2Mi40NjQ2LC04NC41MjMgMCwwIDEwNC40NjUsMy4xMjUgMTM1LjMwMSwzLjEyNSBWIDE5NS42MjkgYyAwLC0xMS44OTUgMjYuMDksLTI4Ljc4MSA1Ny4wNzgsLTI4Ljc4MSAzMC45OTYsMCA1OC4xMDIsMTYuNzE4IDU4LjEwMiwyOC43ODEgdiAxNzkuODIgYyAtMTIuNzYyLDQwLjQzNCAtNDYuNTU5LDYwLjMxNyAtNDYuNjM3LDYwLjk5NiBsIDQ2LjYzNywtMC4zMDgiIC8+CiAgICAgIDxwYXRoIHN0eWxlPSJmaWxsOiNkZDFkMjU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIGQ9Im0gMzIwLjQ1Myw5MDIuMTI1IGMgNS44NzksMCAxMC42MzcsNC43NjYgMTAuNjM3LDEwLjYyNSAwLDUuODc5IC00Ljc1OCwxMC41OTggLTEwLjYzNywxMC41OTggLTUuNzQ2LDAgLTEwLjUxNSwtNC43MTkgLTEwLjUxNSwtMTAuNTk4IDAsLTUuODU5IDQuNzY5LC0xMC42MjUgMTAuNTE1LC0xMC42MjUiIC8+CiAgICAgIDxwYXRoIHN0eWxlPSJmaWxsOiNkZDFkMjU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIGQ9Im0gMjk1LjE5OSw4NzYuNzgxIGMgNS44NTYsMCAxMC41MTYsNC43NyAxMC41MTYsMTAuNjI1IDAsNS43ODkgLTQuNjYsMTAuNTc4IC0xMC41MTYsMTAuNTc4IC01LjkwNiwwIC0xMC42MzMsLTQuNzg5IC0xMC42MzMsLTEwLjU3OCAwLC01Ljg1NSA0LjcyNywtMTAuNjI1IDEwLjYzMywtMTAuNjI1IiAvPjxwYXRoIHN0eWxlPSJmaWxsOiNkZDFkMjU7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIGQ9Im0gMzQ1LjkxNCw4NzYuNzgxIGMgNS44NDQsMCAxMC41MjcsNC43NyAxMC41MjcsMTAuNjI1IDAsNS43ODkgLTQuNjgzLDEwLjU3OCAtMTAuNTI3LDEwLjU3OCAtNS44OTgsMCAtMTAuNjI1LC00Ljc4OSAtMTAuNjI1LC0xMC41NzggMCwtNS44NTUgNC43MjcsLTEwLjYyNSAxMC42MjUsLTEwLjYyNSIgLz4KICAgICAgPHBhdGggc3R5bGU9ImZpbGw6I2RkMWQyNTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgZD0iTSAxMTAxLjI3LDc1OC4yNSBIIDg4NC4yNjIgViA0MTEuNjkxIGMgMCwwIDcuNDI2LC01LjgzMiAyOC45NTMsLTUuODMyIDIxLjUyNywwIDI4Ljk1Myw1LjgzMiAyOC45NTMsNS44MzIgbCAtMC4wMjMsMTUyLjExIGggMTI0LjA2NSBjIDAsMCA0LjQ1LDUuNjgzIDQuNDUsMjIuMTUyIDAsMTYuNDg4IC00LjQ1LDIyLjE5NSAtNC40NSwyMi4xOTUgMCwwIC03Ny42OSwwIC05NC4wNDIsMCAtMTcuNzY2LC0yLjQ4OCAtMzAuMDIzLC0xNS4wMzUgLTMwLjAyMywtMTUuMDM1IHYgMTIwLjgyOCBoIDE1OS4xMjUgYyAwLDAgNC40Myw1LjY4NCA0LjQzLDIyLjE1NyAwLDE2LjQ0OSAtNC40MywyMi4xNTIgLTQuNDMsMjIuMTUyIiAvPgotICAgICA8L2c+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4=`;

  const failureRowsHtml = isFailed
    ? `
      ${!isOmprovSakerhet && state.result.drivingResult === 'Godkänt' ? `<h2 style="color: green; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Din körning är godkänd.</h2>` : ''}
      ${!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' ? `<h2 style="color: red; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Din körning är underkänd.</h2>` : ''}
      ${isSafetyCheckRequired && !isOmprovKorning && state.result.safetyCheckResult === 'Underkänt' ? `<h2 style="color: red; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Din säkerhetskontroll är underkänd.</h2>` : ''}
      ${isSafetyCheckRequired && !isOmprovKorning && state.result.safetyCheckResult === 'Godkänt' && state.result.drivingResult === 'Underkänt' ? `<h2 style="color: green; font-size: 20px; margin: 10px 0; font-weight: bold;">Din säkerhetskontroll är godkänd.</h2>` : ''}
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
    <title>Körprovsresultat - ${studentName}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 20px; background-color: #fff; }
        .resultContainer { width: 100%; max-width: 800px; margin: 0 auto; }
        .infoTable td { padding: 4px 20px 4px 0; vertical-align: top; }
        .resultHeaderLabel { font-size: 13px; font-weight: bold; color: #000; margin-bottom: 2px; }
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
                    <td style="vertical-align: top; width: 220px;">
                        <img class="logo" src="${provprotokollLogoImg}" alt="ProvProtokoll" style="max-height: 52px; max-width: 220px; object-fit: contain; display: block;" />
                    </td>
                    <td></td>
                    <td style="vertical-align: top; text-align: right;">
                        <div class="print-btn">
                            <a href="javascript:window.print()" style="color: #0066cc; text-decoration: underline; font-size: 13px; font-weight: bold;">Skriv ut</a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <div style="margin-top: 30px;">
                            <h1 style="font-size: 26px; margin: 0 0 14px 0; font-weight: bold;">Körprovsresultat</h1>
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
            <table style="border-collapse: collapse;">
                <tbody>
                    <tr>
                        <td style="padding-right: 50px; padding-bottom: 4px;"><b>Prov</b></td>
                        <td style="padding-bottom: 4px;"><b>Resultat</b></td>
                    </tr>
                    ${showDrivingRow ? `
                    <tr>
                        <td style="padding-right: 50px; padding-bottom: 3px;">Körning</td>
                        <td style="padding-bottom: 3px;">${drivingResultText}</td>
                    </tr>` : ''}
                    ${showSafetyCheckRow ? `
                    <tr>
                        <td style="padding-right: 50px; padding-bottom: 3px;">Säkerhetskontroll</td>
                        <td style="padding-bottom: 3px;">${!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' ? '-' : (state.result.safetyCheckResult || '-')}</td>
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

export function generateEmailProtocolHtml(state: AppState, inspectorName?: string): string {
  const licenseType = state.properties.licenseType || 'B';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  const isSafetyCheckRequired = [...HEAVY_LICENSES, 'BE'].includes(licenseType);
  const isTaxi = licenseType === 'TAXI';

  const isOmprovSakerhet = state.properties.testType === 'Omprov säkerhetskontroll';
  const isOmprovKorning = state.properties.testType === 'Omprov körning';

  let isGodkand = false;
  if (isOmprovSakerhet) {
    if (state.result.safetyCheckResult === 'Godkänt') isGodkand = true;
  } else if (isOmprovKorning) {
    if (state.result.drivingResult === 'Godkänt') isGodkand = true;
  } else {
    const safetyCheckPassedOrNotNeeded = !isSafetyCheckRequired || state.result.safetyCheckResult === 'Godkänt';
    const drivingPassed = state.result.drivingResult === 'Godkänt';
    isGodkand = drivingPassed && safetyCheckPassedOrNotNeeded;
  }

  const studentName = state.properties.studentName || 'Förnamn Efternamn';
  const pnr = state.properties.personalNumber || 'XXXXXX-XXXX';
  const testDate = state.properties.testDate || new Date().toISOString().split('T')[0];
  const examiner = inspectorName || state.properties.examiner || 'Rasmus Lundin';

  let drivingResultText = state.result.drivingResult || '-';
  if (drivingResultText === 'Godkänt') {
    const details: string[] = [];
    if (state.properties.transmission === 'Automat') details.push('Automat');
    if (state.properties.tachograph === 'Utan färdskrivare') details.push('Utan färdskrivare');
    if (details.length > 0) drivingResultText = `Godkänt (${details.join(', ')})`;
  }

  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <title>Körprovsresultat - ${studentName}</title>
</head>
<body style="margin:0;padding:20px;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="680" border="0" cellspacing="0" cellpadding="0" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color:#002F6C;padding:28px 36px;color:#ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:0.5px;color:#ffffff;">PROVPROTOKOLL</h1>
                    <p style="margin:4px 0 0 0;font-size:12px;color:#93c5fd;text-transform:uppercase;letter-spacing:1px;">Officiellt Förarprovsbeslut</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:bold;text-transform:uppercase;${isGodkand ? 'background-color:#10b981;color:#ffffff;' : 'background-color:#ef4444;color:#ffffff;'}">
                      ${isGodkand ? '✓ Godkänt' : '✗ Underkänt'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px 36px;">
              <h2 style="margin:0 0 20px 0;font-size:18px;color:#0f172a;font-weight:700;">Hej ${studentName},</h2>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#334155;">
                Här är det officiella beslutet och protokollet för ditt genomförda körprov.
              </p>

              <!-- Info Table Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;width:50%;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Kandidat</div>
                    <div style="font-size:14px;font-weight:600;color:#0f172a;">${studentName}</div>
                  </td>
                  <td style="padding:16px 20px;width:50%;border-bottom:1px solid #e2e8f0;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Personnummer</div>
                    <div style="font-size:14px;font-weight:600;color:#0f172a;font-family:monospace;">${pnr}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-right:1px solid #e2e8f0;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Behörighet & Provtyp</div>
                    <div style="font-size:14px;font-weight:600;color:#0f172a;">${licenseType} – ${state.properties.testType || 'Körprov'} (${state.properties.transmission || 'Manuell'})</div>
                  </td>
                  <td style="padding:16px 20px;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Datum & Provförrättare</div>
                    <div style="font-size:14px;font-weight:600;color:#0f172a;">${testDate} – ${examiner}</div>
                  </td>
                </tr>
              </table>

              <!-- Delresultat -->
              <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">Delresultat</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;border-collapse:collapse;">
                <tr style="background-color:#f1f5f9;">
                  <th align="left" style="padding:10px 14px;font-size:12px;color:#475569;font-weight:700;border-radius:6px 0 0 6px;">Delmoment</th>
                  <th align="right" style="padding:10px 14px;font-size:12px;color:#475569;font-weight:700;border-radius:0 6px 6px 0;">Utfall</th>
                </tr>
                ${!isOmprovSakerhet ? `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:12px 14px;font-size:14px;color:#1e293b;font-weight:600;">Körning i trafik</td>
                  <td align="right" style="padding:12px 14px;font-size:14px;font-weight:bold;${state.result.drivingResult === 'Godkänt' ? 'color:#10b981;' : 'color:#ef4444;'}">
                    ${drivingResultText}
                  </td>
                </tr>` : ''}
                ${isSafetyCheckRequired && !isOmprovKorning ? `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:12px 14px;font-size:14px;color:#1e293b;font-weight:600;">Säkerhetskontroll (Tung behörighet)</td>
                  <td align="right" style="padding:12px 14px;font-size:14px;font-weight:bold;${state.result.safetyCheckResult === 'Godkänt' ? 'color:#10b981;' : 'color:#ef4444;'}">
                    ${state.result.safetyCheckResult || '-'}
                  </td>
                </tr>` : ''}
              </table>

              <!-- Bedömningsutlåtande -->
              <div style="padding:18px 22px;border-radius:8px;margin-bottom:28px;${isGodkand ? 'background-color:#ecfdf5;border-left:4px solid #10b981;' : 'background-color:#fef2f2;border-left:4px solid #ef4444;'}">
                <div style="font-size:15px;font-weight:bold;margin-bottom:6px;${isGodkand ? 'color:#065f46;' : 'color:#991b1b;'}">
                  ${isGodkand ? 'Provets helhetsbedömning är GODKÄND' : 'Provets helhetsbedömning är UNDERKÄND'}
                </div>
                <p style="margin:0;font-size:13px;line-height:1.5;${isGodkand ? 'color:#047857;' : 'color:#b91c1c;'}">
                  ${isGodkand 
                    ? (isTaxi 
                        ? 'Grattis till godkänt taxiförarprov! Du kan nu ansöka om taxiförarlegitimation hos Transportstyrelsen.'
                        : 'Grattis till ditt godkända förarprov! Du kan nu köra med giltig legitimation i Sverige i upp till 2 månader.')
                    : 'Din körning uppvisar brister som behöver vidare övning och utveckling innan nytt prov genomförs.'}
                </p>
              </div>

              ${!isGodkand && drivingFail?.primaryCause?.area ? `
              <!-- Deficiencies List -->
              <div style="margin-bottom:28px;background-color:#fff7ed;border:1px solid #ffedd5;border-radius:8px;padding:16px 20px;">
                <div style="font-size:12px;font-weight:800;color:#9a3412;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
                  Identifierad brist i körningen
                </div>
                <div style="font-size:14px;font-weight:700;color:#c2410c;margin-bottom:6px;">
                  Område: ${drivingFail.primaryCause.area}
                </div>
                ${drivingFail.primaryCause.deficiencies && drivingFail.primaryCause.deficiencies.length > 0 ? `
                <ul style="margin:6px 0 0 0;padding-left:20px;font-size:13px;color:#7c2d12;">
                  ${drivingFail.primaryCause.deficiencies.map(d => `<li style="margin-bottom:3px;">${d}</li>`).join('')}
                </ul>` : ''}
              </div>` : ''}

              <!-- Provinnehåll -->
              ${state.includedTestItems && state.includedTestItems.length > 0 ? `
              <div style="margin-bottom:24px;">
                <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
                  Ingående moment under körprovet
                </div>
                <div style="font-size:12px;color:#334155;line-height:1.8;">
                  ${state.includedTestItems.map(i => `<span style="display:inline-block;background-color:#f1f5f9;padding:3px 8px;border-radius:4px;margin-right:6px;margin-bottom:6px;border:1px solid #e2e8f0;">${i}</span>`).join('')}
                </div>
              </div>` : ''}

              <div style="border-top:1px solid #e2e8f0;padding-top:20px;font-size:12px;color:#64748b;line-height:1.5;">
                Detta är ett automatiskt genererat provprotokoll från provprotokollsystemet. Beslutet har registrerats digitalt och signerats av förarprövare ${examiner}.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:18px 36px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
              ProvProtokoll Sverige • Säker digital provhantering & certifiering
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
