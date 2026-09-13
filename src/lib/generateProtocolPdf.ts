import { jsPDF } from 'jspdf';
import { AppState } from '../types';
import provprotokollLogoImg from '../assets/images/provprotokoll_logo.png';

export function generateProtocolPdf(state: AppState, inspectorName?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  let y = margin;

  const checkPageOffset = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin - 35) {
      doc.addPage();
      y = margin;
    }
  };

  const licenseType = state.properties.licenseType || 'B';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  const isSafetyCheckRequired = [...HEAVY_LICENSES, 'B', 'B96', 'BE', 'Lokförare'].includes(licenseType);
  const isTaxi = licenseType === 'TAXI';

  const isOmprovSakerhet = state.properties.testType?.includes('Omprov säkerhetskontroll');
  const isOmprovKorning = state.properties.testType?.includes('Omprov körning');

  let isPassed = false;
  let isFailed = false;

  if (isOmprovSakerhet) {
    if (state.result.safetyCheckResult === 'Godkänt') isPassed = true;
    if (state.result.safetyCheckResult === 'Underkänt') isFailed = true;
  } else if (isOmprovKorning) {
    if (state.result.drivingResult === 'Godkänt') isPassed = true;
    if (state.result.drivingResult === 'Underkänt') isFailed = true;
  } else {
    const safetyCheckPassedOrNotNeeded = !isSafetyCheckRequired || state.result.safetyCheckResult === 'Godkänt';
    const drivingPassed = state.result.drivingResult === 'Godkänt';
    isPassed = drivingPassed && safetyCheckPassedOrNotNeeded;
    isFailed = state.result.drivingResult === 'Underkänt' || (isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt');
  }

  // --- 1. TOP HEADER: LOGOTYP & PRINT LABEL ---
  try {
    // 160pt width x 44pt height
    doc.addImage(provprotokollLogoImg, 'PNG', margin, y, 160, 44);
  } catch (_) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 47, 108);
    doc.text('ProvProtokoll', margin, y + 25);
  }

  y += 65;

  // --- 2. HUVUDRUBRIK: Körprovsresultat ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text('Körprovsresultat', margin, y);
  y += 24;

  // --- 3. METADATA 2-KOLUMNS TABELL ---
  let testTypeLabel = licenseType === 'B96' ? 'Släpvagn' : `Körprov ${licenseType}`;
  if (licenseType === 'B96') {
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
    testTypeLabel = `Bedömningsprov (${licenseType})`;
  } else if (state.properties.testType?.includes('Omprov säkerhetskontroll och körning')) {
    testTypeLabel = `Omprov säkerhetskontroll och körning ${licenseType}`;
  } else if (state.properties.testType?.includes('Omprov säkerhetskontroll')) {
    testTypeLabel = `Säkerhetskontroll ${licenseType}`;
  } else if (state.properties.testType?.includes('Omprov körning')) {
    testTypeLabel = `Omprov körning ${licenseType}`;
  }

  const col1X = margin;
  const col2X = margin + (contentWidth / 2);

  // Rad 1: Namn & Personnummer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Namn:', col1X, y);
  doc.text('Personnummer:', col2X, y);
  y += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(state.properties.studentName || 'Förnamn Efternamn', col1X, y);
  doc.text(state.properties.personalNumber || '19820209-4937', col2X, y);
  y += 18;

  // Rad 2: Provtyp & Provdatum
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Provtyp:', col1X, y);
  doc.text('Provdatum:', col2X, y);
  y += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(testTypeLabel, col1X, y);
  doc.text(state.properties.testDate || new Date().toISOString().split('T')[0], col2X, y);
  y += 18;

  // Rad 3: Provförrättare
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Provförrättare:', col1X, y);
  y += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(inspectorName || state.properties.examiner || 'Rasmus Lundin', col1X, y);
  y += 24;

  // --- 4. BEHÖRIGETSINFORMATION ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Behörighetsinformation', margin, y);
  y += 13;

  let behorighetText = 'Ingen behörighet uppnådd.';
  const isAssessmentOnly = state.properties.testType?.includes('Testprov') || state.properties.testType?.includes('Bedömningsprov');
  if (isPassed && licenseType && !isAssessmentOnly && !isTaxi) {
    behorighetText = `Behörighet uppnådd: ${licenseType}`;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(behorighetText, margin, y);
  y += 26;

  // --- 5. RESULTATTABELL (Prov / Resultat) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Prov', margin, y);
  doc.text('Resultat', margin + 140, y);
  y += 15;

  const showDrivingRow = !isOmprovSakerhet;
  const showSafetyCheckRow = isSafetyCheckRequired && !isOmprovKorning;

  if (showDrivingRow) {
    doc.setFont('helvetica', 'normal');
    doc.text('Körning', margin, y);

    let drivingText = state.result.drivingResult || '-';
    if (drivingText === 'Godkänt') {
      const details: string[] = [];
      if (state.properties.transmission === 'Automat') details.push('Automat');
      if (state.properties.tachograph === 'Utan färdskrivare') details.push('Utan färdskrivare');
      if (details.length > 0) drivingText = `Godkänt (${details.join(', ')})`;
    }
    doc.text(drivingText, margin + 140, y);
    y += 14;
  }

  if (showSafetyCheckRow) {
    doc.setFont('helvetica', 'normal');
    doc.text('Säkerhetskontroll', margin, y);
    const safeText = (!isOmprovSakerhet && state.result.drivingResult === 'Underkänt') ? '-' : (state.result.safetyCheckResult || '-');
    doc.text(safeText, margin + 140, y);
    y += 14;
  }

  y += 14;

  // --- 6. LAGSTIFTNINGSTEXT ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);

  const legislationText = isTaxi 
    ? 'Detta beslut grundas på taxitrafiklagen (2012:211) och taxitrafikförordningen (2012:238).'
    : 'Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.';
  
  doc.text(legislationText, margin, y);
  y += 13;
  doc.text('Här ser du ditt resultat inom provets olika ämnesområden.', margin, y);
  y += 24;

  // --- 7. BESLUTSRUBRIKER (Godkänt / Underkänt i grönt/rött) ---
  if (!isOmprovSakerhet && state.result.drivingResult === 'Godkänt') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 128, 0);
    doc.text('Din körning är godkänd.', margin, y);
    y += 20;
  } else if (!isOmprovSakerhet && state.result.drivingResult === 'Underkänt') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(215, 0, 0);
    doc.text('Din körning är underkänd.', margin, y);
    y += 20;
  }

  if (isSafetyCheckRequired && !isOmprovKorning && state.result.safetyCheckResult === 'Underkänt') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(215, 0, 0);
    doc.text('Din säkerhetskontroll är underkänd.', margin, y);
    y += 20;
  } else if (isSafetyCheckRequired && !isOmprovKorning && state.result.safetyCheckResult === 'Godkänt' && state.result.drivingResult === 'Underkänt') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 128, 0);
    doc.text('Din säkerhetskontroll är godkänd.', margin, y);
    y += 20;
  }

  // --- 8. GRUNDORSAK & KONSEKVENSER MED EXAKTA RAMAR (#C0504D och #F79646) ---
  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;

  if (isFailed) {
    // Grundorsak körning
    if (drivingFail?.primaryCause?.area && state.result.drivingResult === 'Underkänt') {
      checkPageOffset(60);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const causeTitle = state.result.safetyCheckResult === 'Underkänt'
        ? 'Grundorsak till körningens underkännande är:'
        : 'Grundorsak till underkännandet är:';
      doc.text(causeTitle, margin, y);
      y += 14;

      // Beräkna boxhöjd
      let defsHeight = 0;
      if (drivingFail.primaryCause.deficiencies && drivingFail.primaryCause.deficiencies.length > 0) {
        defsHeight = drivingFail.primaryCause.deficiencies.length * 14;
      }
      const boxHeight = 44 + defsHeight;

      checkPageOffset(boxHeight + 10);
      // Rita ram: 3px #C0504D (RGB: 192, 80, 77)
      doc.setDrawColor(192, 80, 77);
      doc.setLineWidth(2.2);
      doc.rect(margin, y, contentWidth, boxHeight);

      let boxInnerY = y + 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(0, 0, 0);
      doc.text(drivingFail.primaryCause.area, margin + 10, boxInnerY);
      boxInnerY += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('Din körning visar brister i att:', margin + 10, boxInnerY);
      boxInnerY += 14;

      if (drivingFail.primaryCause.deficiencies) {
        drivingFail.primaryCause.deficiencies.forEach(def => {
          doc.setFillColor(0, 0, 0);
          doc.circle(margin + 16, boxInnerY - 3, 2, 'F');
          doc.text(def, margin + 24, boxInnerY);
          boxInnerY += 14;
        });
      }

      y += boxHeight + 16;
    }

    // Konsekvenser körning
    if (drivingFail?.consequences && drivingFail.consequences.length > 0 && state.result.drivingResult === 'Underkänt') {
      checkPageOffset(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Detta får konsekvenser på:', margin, y);
      y += 14;

      drivingFail.consequences.forEach(cons => {
        if (!cons.area) return;
        let defsHeight = 0;
        if (cons.deficiencies && cons.deficiencies.length > 0) {
          defsHeight = cons.deficiencies.length * 14;
        }
        const boxHeight = 44 + defsHeight;

        checkPageOffset(boxHeight + 10);
        // Rita ram: 3px #F79646 (RGB: 247, 150, 70)
        doc.setDrawColor(247, 150, 70);
        doc.setLineWidth(2.2);
        doc.rect(margin, y, contentWidth, boxHeight);

        let boxInnerY = y + 16;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(0, 0, 0);
        doc.text(cons.area, margin + 10, boxInnerY);
        boxInnerY += 15;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text('Din körning visar brister i att:', margin + 10, boxInnerY);
        boxInnerY += 14;

        if (cons.deficiencies) {
          cons.deficiencies.forEach(def => {
            doc.setFillColor(0, 0, 0);
            doc.circle(margin + 16, boxInnerY - 3, 2, 'F');
            doc.text(def, margin + 24, boxInnerY);
            boxInnerY += 14;
          });
        }

        y += boxHeight + 14;
      });
    }

    // Grundorsak säkerhetskontroll
    if (isSafetyCheckRequired && safetyFail?.primaryCause?.area && state.result.safetyCheckResult === 'Underkänt') {
      checkPageOffset(60);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const safeTitle = state.result.drivingResult === 'Underkänt'
        ? 'Grundorsak till säkerhetskontrollens underkännande är:'
        : 'Grundorsak till underkännandet är:';
      doc.text(safeTitle, margin, y);
      y += 14;

      let defsHeight = 0;
      if (safetyFail.primaryCause.deficiencies && safetyFail.primaryCause.deficiencies.length > 0) {
        defsHeight = safetyFail.primaryCause.deficiencies.length * 14;
      }
      const boxHeight = 44 + defsHeight;

      checkPageOffset(boxHeight + 10);
      doc.setDrawColor(192, 80, 77);
      doc.setLineWidth(2.2);
      doc.rect(margin, y, contentWidth, boxHeight);

      let boxInnerY = y + 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(safetyFail.primaryCause.area, margin + 10, boxInnerY);
      boxInnerY += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('Din säkerhetskontroll visar brister i att:', margin + 10, boxInnerY);
      boxInnerY += 14;

      if (safetyFail.primaryCause.deficiencies) {
        safetyFail.primaryCause.deficiencies.forEach(def => {
          doc.setFillColor(0, 0, 0);
          doc.circle(margin + 16, boxInnerY - 3, 2, 'F');
          doc.text(def, margin + 24, boxInnerY);
          boxInnerY += 14;
        });
      }

      y += boxHeight + 16;
    }

    // Situationer
    const allSituations = Array.from(new Set([
      ...(state.result.drivingResult === 'Underkänt' ? (drivingFail?.situations || []) : []),
      ...(state.result.safetyCheckResult === 'Underkänt' ? (safetyFail?.situations || []) : [])
    ]));

    if (allSituations.length > 0) {
      checkPageOffset(30 + allSituations.length * 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Brister har visat sig i följande situationer:', margin, y);
      y += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      allSituations.forEach(sit => {
        doc.setFillColor(0, 0, 0);
        doc.circle(margin + 6, y - 3, 2, 'F');
        doc.text(sit, margin + 14, y);
        y += 14;
      });
      y += 8;
    }

    if (state.result.interventionOccurred) {
      checkPageOffset(20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Ingripande har förekommit.', margin, y);
      y += 18;
    }
  }

  // --- 9. FÖLJANDE PROVINNEHÅLL HAR INGÅTT I DITT KÖRPROV ---
  checkPageOffset(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Följande provinnehåll har ingått i ditt körprov:', margin, y);
  y += 15;

  if (state.includedTestItems && state.includedTestItems.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    state.includedTestItems.forEach(item => {
      const lines = doc.splitTextToSize(item, contentWidth - 25);
      checkPageOffset(lines.length * 13 + 4);
      doc.setFillColor(0, 0, 0);
      doc.circle(margin + 6, y - 3, 2, 'F');
      lines.forEach((line: string) => {
        doc.text(line, margin + 14, y);
        y += 13;
      });
    });
    y += 14;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.text('Inga specifika moment registrerade.', margin, y);
    y += 18;
  }

  // --- 10. AVSLUTANDE TEXT & VAD HÄNDER NU ---
  checkPageOffset(50);
  if (isFailed) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const failClosing = isTaxi
      ? 'Du uppfyllde inte kraven för godkänt taxiförarprov enligt taxitrafiklagen (2012:211). Det är viktigt att du tränar mer innan du genomför ditt nästa prov.\nVälkommen åter!'
      : 'Det är viktigt att du tränar mer innan du genomför ditt nästa körprov.\nVälkommen åter!';
    const failLines = doc.splitTextToSize(failClosing, contentWidth);
    failLines.forEach((l: string) => {
      doc.text(l, margin, y);
      y += 14;
    });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Vad händer nu?', margin, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    let passClosing = 'Grattis till ditt körkort! Du kan nu köra med en giltig legitimation i Sverige tills du har fått ditt körkort, dock i max två månader.';
    if (isTaxi) {
      passClosing = 'Grattis till godkänt taxiförarprov! Du kan nu ansöka om taxiförarlegitimation hos Transportstyrelsen enligt taxitrafiklagen (2012:211). Legitimationen utfärdas efter prövning av övriga krav.';
    } else if (isAssessmentOnly) {
      passClosing = 'Grattis till ett godkänt bedömningsprov! Du uppfyller de formella kompetenskraven för körbedömning. Du kan nu bifoga detta intyg för ansökan och behörighetsprövning till trafiklärarutbildning samt vidare prövning för förarprövar- / inspektörsbehörighet.';
    }
    const passLines = doc.splitTextToSize(passClosing, contentWidth);
    passLines.forEach((l: string) => {
      doc.text(l, margin, y);
      y += 14;
    });
  }

  // Sidfot med sidnummer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const pageStr = totalPages > 1 ? `Sida ${i} av ${totalPages}` : '';
    if (pageStr) {
      doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - 20);
    }
  }

  const cleanName = (state.properties.studentName || 'Protokoll').replace(/\s+/g, '_');
  const dateStr = state.properties.testDate || new Date().toISOString().split('T')[0];
  const filename = `Korprovsresultat_${cleanName}_${dateStr}.pdf`;

  doc.save(filename);
}
