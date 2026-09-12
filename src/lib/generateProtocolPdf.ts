import { jsPDF } from 'jspdf';
import { AppState } from '../types';

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
    if (y + requiredHeight > pageHeight - margin - 30) {
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

  // --- HEADER ---
  // Blue accent bar
  doc.setFillColor(0, 47, 108); // Trafikverket Dark Blue
  doc.rect(margin, y, 8, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 47, 108);
  doc.text('PROVPROTOKOLL', margin + 16, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('DIGITAL PROVHANTERING & BESLUT', margin + 16, y + 33);

  // Status Badge on top right
  const badgeWidth = 100;
  const badgeX = pageWidth - margin - badgeWidth;
  doc.setLineWidth(1);

  if (isPassed) {
    doc.setFillColor(235, 247, 238);
    doc.setDrawColor(46, 125, 50);
    doc.rect(badgeX, y + 4, badgeWidth, 26, 'DF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(46, 125, 50);
    doc.text('GODKÄNT', badgeX + 22, y + 21);
  } else if (isFailed) {
    doc.setFillColor(253, 237, 237);
    doc.setDrawColor(211, 47, 47);
    doc.rect(badgeX, y + 4, badgeWidth, 26, 'DF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47);
    doc.text('UNDERKÄNT', badgeX + 16, y + 21);
  } else {
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(150, 150, 150);
    doc.rect(badgeX, y + 4, badgeWidth, 26, 'DF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('PÅGÅENDE', badgeX + 20, y + 21);
  }

  y += 52;

  // Horizontal divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(1);
  doc.line(margin, y, margin + contentWidth, y);
  y += 18;

  // --- CANDIDATE & PROV DETAILS BOX ---
  checkPageOffset(90);
  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(220, 230, 242);
  doc.rect(margin, y, contentWidth, 85, 'DF');

  let boxY = y + 16;
  const col1 = margin + 14;
  const col2 = margin + 260;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 120);
  doc.text('KANDIDAT', col1, boxY);
  doc.text('PERSONNUMMER', col2, boxY);
  boxY += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(state.properties.studentName || 'Saknas', col1, boxY);
  doc.text(state.properties.personalNumber || 'Saknas', col2, boxY);
  boxY += 20;

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 120);
  doc.text('PROVTYP / BEHÖRIGHET', col1, boxY);
  doc.text('PROVDATUM & TRANSMISSION', col2, boxY);
  boxY += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  let provtypPdfText = `Körprov ${licenseType} (${state.properties.testType || 'Förstaprov'})`;
  if (state.properties.testType?.includes('Bedömningsprov') || state.properties.testType?.includes('Testprov')) {
    provtypPdfText = `Bedömningsprov (${licenseType})`;
  } else if (state.properties.testType?.includes('Omprov säkerhetskontroll')) {
    provtypPdfText = `Säkerhetskontroll ${licenseType}`;
  } else if (state.properties.testType?.includes('Omprov körning')) {
    provtypPdfText = `Omprov körning ${licenseType}`;
  }
  doc.text(provtypPdfText, col1, boxY);
  const tachText = state.properties.tachograph ? ` • ${state.properties.tachograph}` : '';
  doc.text(`${state.properties.testDate || '-'} • ${state.properties.transmission || 'Manuell'}${tachText}`, col2, boxY);
  boxY += 20;

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 120);
  doc.text('PROVFÖRRÄTTARE / INSPEKTÖR', col1, boxY);
  doc.text('E-POST', col2, boxY);
  boxY += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(inspectorName || state.properties.examiner || 'Rasmus Lundin', col1, boxY);
  doc.text(state.properties.email || 'Kandidat e-post saknas', col2, boxY);

  y += 102;

  // --- RESULTS TABLE ---
  checkPageOffset(80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 47, 108);
  doc.text('PROVDELAR OCH DELRESULTAT', margin, y);
  y += 14;

  // Table header
  doc.setFillColor(240, 243, 248);
  doc.rect(margin, y, contentWidth, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 70, 80);
  doc.text('PROVMOMENT', margin + 10, y + 13);
  doc.text('RESULTAT', margin + contentWidth - 80, y + 13);
  y += 24;

  const showDrivingRow = !state.properties.testType?.includes('Omprov säkerhetskontroll');
  const showSafetyRow = isSafetyCheckRequired && !state.properties.testType?.includes('Omprov körning');

  if (showDrivingRow) {
    checkPageOffset(20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text('Körning i trafik', margin + 10, y);

    doc.setFont('helvetica', 'bold');
    if (state.result.drivingResult === 'Godkänt') {
      doc.setTextColor(46, 125, 50);
    } else if (state.result.drivingResult === 'Underkänt') {
      doc.setTextColor(211, 47, 47);
    } else {
      doc.setTextColor(100, 100, 100);
    }
    const drvConditions: string[] = [];
    if (state.properties.transmission === 'Automat') drvConditions.push('Automat');
    if (state.properties.tachograph === 'Utan färdskrivare') drvConditions.push('Utan färdskrivare');
    const drvSuffix = drvConditions.length > 0 ? ` (${drvConditions.join(', ')})` : '';
    const drvText = state.result.drivingResult === 'Godkänt'
      ? `Godkänt${drvSuffix}`
      : (state.result.drivingResult || 'Ej angiven');
    doc.text(drvText, margin + contentWidth - 140, y);
    y += 18;
  }

  if (showSafetyRow) {
    checkPageOffset(20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text('Säkerhetskontroll', margin + 10, y);

    doc.setFont('helvetica', 'bold');
    const safeRes = (!isOmprovSakerhet && state.result.drivingResult === 'Underkänt') ? '-' : (state.result.safetyCheckResult || '-');
    if (safeRes === 'Godkänt') {
      doc.setTextColor(46, 125, 50);
    } else if (safeRes === 'Underkänt') {
      doc.setTextColor(211, 47, 47);
    } else {
      doc.setTextColor(100, 100, 100);
    }
    doc.text(safeRes, margin + contentWidth - 140, y);
    y += 18;
  }

  y += 10;

  // --- DEFICIENCIES & FAILURES IF ANY ---
  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;

  if (isFailed) {
    checkPageOffset(40);

    // Official Trafikverket headline banners
    if (state.result.drivingResult === 'Godkänt') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 125, 50);
      doc.text('Din körning är godkänd.', margin, y + 10);
      y += 18;
    } else if (state.result.drivingResult === 'Underkänt') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(211, 47, 47);
      doc.text('Din körning är underkänd.', margin, y + 10);
      y += 18;
    }

    if (isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' && !isOmprovKorning) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 125, 50);
      doc.text('Din säkerhetskontroll är godkänd.', margin, y + 10);
      y += 18;
    } else if (isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(211, 47, 47);
      doc.text('Din säkerhetskontroll är underkänd.', margin, y + 10);
      y += 18;
    }

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47);
    doc.text('MOTIVERING OCH BRISTFÖRTECKNING', margin, y);
    y += 16;

    if (state.result.drivingResult === 'Underkänt' && drivingFail?.primaryCause?.area) {
      checkPageOffset(60);
      doc.setDrawColor(211, 47, 47);
      doc.setFillColor(255, 245, 245);
      doc.setLineWidth(1.5);
      
      const areaTitle = `Grundorsak (Körning): ${drivingFail.primaryCause.area}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(180, 0, 0);
      doc.text(areaTitle, margin + 10, y + 14);

      let innerY = y + 28;
      if (drivingFail.primaryCause.deficiencies && drivingFail.primaryCause.deficiencies.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);
        drivingFail.primaryCause.deficiencies.forEach(def => {
          doc.text(`• ${def}`, margin + 15, innerY);
          innerY += 13;
        });
      }

      const boxH = innerY - y + 6;
      doc.rect(margin, y, contentWidth, boxH, 'DF');
      
      // Redraw text over box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(180, 0, 0);
      doc.text(areaTitle, margin + 10, y + 14);

      if (drivingFail.primaryCause.deficiencies && drivingFail.primaryCause.deficiencies.length > 0) {
        let textY = y + 28;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);
        drivingFail.primaryCause.deficiencies.forEach(def => {
          doc.text(`• ${def}`, margin + 15, textY);
          textY += 13;
        });
      }

      y += boxH + 14;
    }

    if (state.result.drivingResult === 'Underkänt' && drivingFail?.consequences && drivingFail.consequences.length > 0) {
      drivingFail.consequences.forEach(cons => {
        if (!cons.area) return;
        checkPageOffset(50);
        doc.setDrawColor(230, 120, 0);
        doc.setFillColor(255, 250, 242);
        doc.setLineWidth(1);

        const consTitle = `Konsekvensområde: ${cons.area}`;
        let textY = y + 26;

        let totalH = 32;
        if (cons.deficiencies && cons.deficiencies.length > 0) {
          totalH += cons.deficiencies.length * 13;
        }

        doc.rect(margin, y, contentWidth, totalH, 'DF');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(200, 90, 0);
        doc.text(consTitle, margin + 10, y + 14);

        if (cons.deficiencies && cons.deficiencies.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40);
          cons.deficiencies.forEach(def => {
            doc.text(`• ${def}`, margin + 15, textY);
            textY += 13;
          });
        }

        y += totalH + 12;
      });
    }

    if (state.result.safetyCheckResult === 'Underkänt' && safetyFail?.primaryCause?.area) {
      checkPageOffset(50);
      doc.setDrawColor(211, 47, 47);
      doc.setFillColor(255, 245, 245);
      doc.setLineWidth(1.5);

      const title = `Grundorsak (Säkerhetskontroll): ${safetyFail.primaryCause.area}`;
      let textY = y + 26;

      let totalH = 32;
      if (safetyFail.primaryCause.deficiencies && safetyFail.primaryCause.deficiencies.length > 0) {
        totalH += safetyFail.primaryCause.deficiencies.length * 13;
      }

      doc.rect(margin, y, contentWidth, totalH, 'DF');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(180, 0, 0);
      doc.text(title, margin + 10, y + 14);

      if (safetyFail.primaryCause.deficiencies && safetyFail.primaryCause.deficiencies.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        safetyFail.primaryCause.deficiencies.forEach(def => {
          doc.text(`• ${def}`, margin + 15, textY);
          textY += 13;
        });
      }

      y += totalH + 12;

      if (safetyFail?.consequences && safetyFail.consequences.length > 0) {
        safetyFail.consequences.forEach(cons => {
          if (!cons.area) return;
          checkPageOffset(50);
          doc.setDrawColor(230, 120, 0);
          doc.setFillColor(255, 250, 242);
          doc.setLineWidth(1);

          const consTitle = `Konsekvensområde: ${cons.area}`;
          let textY = y + 26;

          let consH = 32;
          if (cons.deficiencies && cons.deficiencies.length > 0) {
            consH += cons.deficiencies.length * 13;
          }

          doc.rect(margin, y, contentWidth, consH, 'DF');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(200, 90, 0);
          doc.text(consTitle, margin + 10, y + 14);

          if (cons.deficiencies && cons.deficiencies.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(40, 40, 40);
            cons.deficiencies.forEach(def => {
              doc.text(`• ${def}`, margin + 15, textY);
              textY += 13;
            });
          }

          y += consH + 12;
        });
      }
    }

    const allSituations = Array.from(new Set([
      ...(state.result.drivingResult === 'Underkänt' ? (drivingFail?.situations || []) : []),
      ...(state.result.safetyCheckResult === 'Underkänt' ? (safetyFail?.situations || []) : [])
    ]));

    if (allSituations.length > 0) {
      checkPageOffset(30 + allSituations.length * 13);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      doc.text('Brister har visat sig i följande situationer:', margin + 6, y);
      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      allSituations.forEach(sit => {
        doc.text(`• ${sit}`, margin + 14, y);
        y += 13;
      });
      y += 6;
    }

    if (state.result.interventionOccurred) {
      checkPageOffset(24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Ingripande har förekommit.', margin, y);
      y += 18;
    }
  }

  // --- INCLUDED TEST ITEMS ---
  checkPageOffset(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 47, 108);
  doc.text('GENOMFÖRDA PROVMOMENT', margin, y);
  y += 14;

  if (state.includedTestItems && state.includedTestItems.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    state.includedTestItems.forEach(item => {
      const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 10);
      checkPageOffset(lines.length * 12 + 2);
      lines.forEach((line: string) => {
        doc.text(line, margin + 6, y);
        y += 12;
      });
    });
    y += 10;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Inga specifika moment registrerades separat.', margin + 6, y);
    y += 12;
  }

  // --- VAD HÄNDER NU ---
  checkPageOffset(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 47, 108);
  doc.text('VAD HÄNDER NU?', margin, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  const isAssessmentOnlyPdf = state.properties.testType?.includes('Bedömningsprov') || state.properties.testType?.includes('Testprov');
  if (isPassed) {
    if (isTaxi) {
      const infoLines = doc.splitTextToSize('Grattis till godkänt taxiförarprov! Du kan nu ansöka om taxiförarlegitimation hos Transportstyrelsen enligt taxitrafiklagen (2012:211). Legitimationen utfärdas efter prövning av övriga krav.', contentWidth);
      infoLines.forEach((l: string) => {
        checkPageOffset(11);
        doc.text(l, margin, y);
        y += 11;
      });
    } else if (isAssessmentOnlyPdf) {
      const infoLines = doc.splitTextToSize('Grattis till ett godkänt bedömningsprov! Du uppfyller de formella kompetenskraven för körbedömning. Du kan nu bifoga detta intyg för ansökan och behörighetsprövning till trafiklärarutbildning samt vidare prövning för förarprövar- / inspektörsbehörighet.', contentWidth);
      infoLines.forEach((l: string) => {
        checkPageOffset(11);
        doc.text(l, margin, y);
        y += 11;
      });
    } else {
      const infoLines = doc.splitTextToSize('Grattis till ditt körkort! Du kan nu köra med en giltig legitimation i Sverige tills du har fått ditt körkort, dock i max två månader.', contentWidth);
      infoLines.forEach((l: string) => {
        checkPageOffset(11);
        doc.text(l, margin, y);
        y += 11;
      });
    }
  } else {
    const failText = isTaxi
      ? 'Du uppfyllde inte kraven för godkänt taxiförarprov enligt taxitrafiklagen (2012:211). Det är viktigt att du tränar mer. Välkommen åter!'
      : 'Det är viktigt att du tränar mer innan du genomför ditt nästa körprov. Välkommen åter!';
    const failLines = doc.splitTextToSize(failText, contentWidth);
    failLines.forEach((l: string) => {
      checkPageOffset(11);
      doc.text(l, margin, y);
      y += 11;
    });
  }
  y += 10;

  // --- SIGNATURE & VERIFICATION SECTION ---
  checkPageOffset(80);
  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, margin + contentWidth, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('SIGNATUR & BESLUTSFÖRRÄTTARE', margin, y);
  doc.text('VERIFIERING OCH DATUM', margin + 280, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(`Digitalt signerad av: ${inspectorName || state.properties.examiner || 'Rasmus Lundin'}`, margin, y);
  doc.text(`Datum: ${state.properties.testDate || new Date().toISOString().split('T')[0]}`, margin + 280, y);
  y += 14;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Verifierad via ProvProtokolls Provsystem (Digital e-signatur)', margin, y);
  doc.text('Detta beslut registrerat hos Transportstyrelsen', margin + 280, y);
  y += 25;

  // --- FOOTER AND PAGE NUMBERS ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);

    // Legal line
    const legalText = isTaxi
      ? 'Detta beslut grundas på taxitrafiklagen (2012:211) och taxitrafikförordningen (2012:238).'
      : 'Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.';
    doc.text(legalText, margin, pageHeight - margin + 10);

    // Page count
    const pageStr = `Sida ${i} av ${totalPages}`;
    doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - margin + 10);
  }

  const cleanName = (state.properties.studentName || 'Protokoll').replace(/\s+/g, '_');
  const dateStr = state.properties.testDate || new Date().toISOString().split('T')[0];
  const filename = `Korprovsresultat_${cleanName}_${dateStr}.pdf`;

  doc.save(filename);
}
