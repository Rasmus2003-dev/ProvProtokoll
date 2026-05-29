import { useState } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../../components/icons/AppLogo';
import { jsPDF } from 'jspdf';
import { OfficialPrintLayout } from './components/OfficialPrintLayout';

export function ProtokollScreen() {
  const { state, saveTest } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'email' | 'beslut'>('beslut');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    let y = 40;
    const margin = 40;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const contentWidth = pageWidth - (margin * 2);

    const checkPageOffset = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Drawing a stylized PDF Header Logo
    doc.setFillColor(16, 62, 84); // #103E54 Dark Slate Blue
    doc.rect(margin, y, 6, 30, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(16, 62, 84);
    doc.text('Digitalt', margin + 12, y + 18);
    
    const provWidth = doc.getTextWidth('Digitalt');
    doc.setTextColor(0, 128, 153);
    doc.text('Provprotokoll', margin + 12 + provWidth + 6, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 102, 112); // #506670
    doc.text('ALLA BEHÖRIGHETER, ETT DIGITALT SYSTEM.', margin + 12, y + 28);

    y += 50;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Körprovsresultat', margin, y);
    y += 20;

    // Candidate details grid
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    const colWidthVal = contentWidth / 2;

    const drawGridRow = (
      label1: string, val1: string,
      label2: string, val2: string
    ) => {
      checkPageOffset(35);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(85, 85, 85);
      doc.text(label1.toUpperCase(), margin, y);

      if (label2) {
        doc.text(label2.toUpperCase(), margin + colWidthVal, y);
      }

      y += 12;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(val1, margin, y);

      if (val2) {
        if (val2 === 'Godkänt') {
          doc.setTextColor(16, 124, 65);
        } else if (val2 === 'Underkänt') {
          doc.setTextColor(200, 0, 24);
        } else {
          doc.setTextColor(0, 0, 0);
        }
        doc.text(val2, margin + colWidthVal, y);
      }

      y += 15;
    };

    drawGridRow(
      'Namn:', state.properties.studentName || 'Saknas',
      'Personnummer:', state.properties.personalNumber || 'Saknas'
    );
    drawGridRow(
      'Provtyp:', `Körprov ${licenseType}`,
      'Provdatum:', state.properties.testDate || 'Saknas'
    );
    drawGridRow(
      'Provförrättare:', state.properties.examiner || 'Saknas',
      '', ''
    );

    doc.line(margin, y, margin + contentWidth, y);
    y += 20;

    // Behörighetsinformation
    checkPageOffset(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Behörighetsinformation', margin, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    if (isPassed) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Behörighet uppnådd: ${licenseType}`, margin, y);
    } else {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Ingen behörighet uppnådd.', margin, y);
    }
    y += 20;

    // Prov & Resultat Table
    checkPageOffset(60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text('Prov', margin, y);
    doc.text('Resultat', margin + 180, y);
    y += 6;

    doc.setDrawColor(229, 229, 229);
    doc.line(margin, y, margin + 280, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text('Körning', margin, y);
    
    doc.setFont('helvetica', 'bold');
    if (state.result.drivingResult === 'Godkänt') {
      doc.setTextColor(16, 124, 65);
    } else {
      doc.setTextColor(200, 0, 24);
    }
    doc.text(state.result.drivingResult || 'Underkänt', margin + 180, y);
    y += 18;

    if (isSafetyCheckRequired) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(0, 0, 0);
      doc.text('Säkerhetskontroll', margin, y);

      const isSafetyUnder = state.result.drivingResult === 'Underkänt';
      doc.setFont('helvetica', 'bold');
      if (isSafetyUnder) {
        doc.setTextColor(0, 0, 0);
        doc.text('-', margin + 180, y);
      } else {
        if (state.result.safetyCheckResult === 'Godkänt') {
          doc.setTextColor(16, 124, 65);
        } else if (state.result.safetyCheckResult === 'Underkänt') {
          doc.setTextColor(200, 0, 24);
        } else {
          doc.setTextColor(0, 0, 0);
        }
        doc.text(state.result.safetyCheckResult || '-', margin + 180, y);
      }
      y += 20;
    }

    checkPageOffset(45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(68, 68, 68);
    
    const lagText = 'Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.';
    const infoText = 'Här ser du ditt resultat inom provets olika ämnesområden.';
    doc.text(lagText, margin, y);
    y += 13;
    doc.text(infoText, margin, y);
    y += 24;

    checkPageOffset(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    if (state.result.drivingResult === 'Godkänt') {
      doc.setTextColor(16, 124, 65);
      doc.text('Din körning är godkänd.', margin, y);
      y += 18;
      if (isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt') {
        checkPageOffset(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(16, 124, 65);
        doc.text('Din säkerhetskontroll är godkänd.', margin, y);
        y += 18;
      }
    } else {
      doc.setTextColor(200, 0, 24);
      doc.text('Din körning är underkänd.', margin, y);
      y += 18;
    }

    if (isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt' && state.result.drivingResult !== 'Underkänt') {
      checkPageOffset(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(200, 0, 24);
      doc.text('Din säkerhetskontroll är underkänd.', margin, y);
      y += 18;
    }
    y += 10;

    const drawDeficiencyBox = (
      headerText: string,
      areaName: string,
      subText: string,
      items: string[],
      colorRGB: [number, number, number],
      titleColorRGB?: [number, number, number]
    ) => {
      const headerHeight = headerText ? 15 : 0;
      const areaHeight = 15;
      const subHeight = 15;
      
      const itemLines: string[][] = [];
      let itemsTotalHeight = 0;
      const bulletMarginLeft = 25;
      const wrapWidth = contentWidth - 30;

      items.forEach(item => {
        const lines = doc.splitTextToSize(item, wrapWidth - bulletMarginLeft);
        itemLines.push(lines);
        itemsTotalHeight += (lines.length * 13) + 3;
      });

      const boxInnerHeight = areaHeight + subHeight + itemsTotalHeight + 6;
      const totalSectionHeight = headerHeight + boxInnerHeight + 15;

      checkPageOffset(totalSectionHeight);

      if (headerText) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(0, 0, 0);
        doc.text(headerText, margin, y);
        y += headerHeight;
      }

      doc.setDrawColor(colorRGB[0], colorRGB[1], colorRGB[2]);
      doc.setLineWidth(3);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, boxInnerHeight, 'S');

      let internalY = y + 15;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      if (titleColorRGB) {
        doc.setTextColor(titleColorRGB[0], titleColorRGB[1], titleColorRGB[2]);
      } else {
        doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]);
      }
      doc.text(areaName, margin + 10, internalY);
      internalY += areaHeight - 1;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(17, 17, 17);
      doc.text(subText, margin + 10, internalY);
      internalY += subHeight - 2;

      itemLines.forEach(lines => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(17, 17, 17);
        doc.text(String.fromCharCode(149), margin + 18, internalY);

        lines.forEach((line) => {
          doc.text(line, margin + 28, internalY);
          internalY += 13;
        });
        internalY += 3;
      });

      y += boxInnerHeight + 15;
    };

    if (isFailed) {
      if (state.result.drivingResult === 'Underkänt' && drivingFail && drivingFail.primaryCause.area) {
        drawDeficiencyBox(
          'Grundorsak till underkännandet är:',
          drivingFail.primaryCause.area,
          'Din körning visar brister i att:',
          drivingFail.primaryCause.deficiencies,
          [192, 80, 77],
          [0, 0, 0]
        );
      }

      if (state.result.drivingResult === 'Underkänt' && drivingFail && drivingFail.consequences.length > 0) {
        checkPageOffset(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(0, 0, 0);
        doc.text('Detta får konsekvenser på:', margin, y);
        y += 15;

        drivingFail.consequences.forEach(cons => {
          drawDeficiencyBox(
            '',
            cons.area,
            'Din körning visar brister i att:',
            cons.deficiencies,
            [247, 150, 70],
            [0, 0, 0]
          );
        });
      }

      if (state.result.safetyCheckResult === 'Underkänt' && safetyFail && safetyFail.primaryCause.area) {
        drawDeficiencyBox(
          'Grundorsak till underkännandet är:',
          safetyFail.primaryCause.area,
          'Din säkerhetskontroll visar brister i att:',
          safetyFail.primaryCause.deficiencies,
          [192, 80, 77],
          [0, 0, 0]
        );
      }

      if (drivingFail && drivingFail.situations.length > 0) {
        checkPageOffset(40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(0, 0, 0);
        doc.text('Brister har visat sig i följande situationer:', margin, y);
        y += 14;

        drivingFail.situations.forEach(sit => {
          const lines = doc.splitTextToSize(sit, contentWidth - 30);
          checkPageOffset((lines.length * 13) + 4);
          doc.text(String.fromCharCode(149), margin + 10, y);
          lines.forEach((line: string) => {
            doc.text(line, margin + 20, y);
            y += 13;
          });
          y += 2;
        });
        y += 15;
      }
      
      if (state.result.interventionOccurred) {
        checkPageOffset(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(200, 0, 24);
        doc.text('Ingripande har förekommit', margin, y);
        y += 18;
      }
    }

    checkPageOffset(80);
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text('Följande provinnehåll har ingått i ditt körprov:', margin, y);
    y += 14;

    if (state.includedTestItems && state.includedTestItems.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);

      for (let i = 0; i < state.includedTestItems.length; i++) {
        const item = state.includedTestItems[i];
        const lines = doc.splitTextToSize(item, contentWidth - 20);

        checkPageOffset((lines.length * 13) + 4);

        doc.text(String.fromCharCode(149), margin + 5, y);
        lines.forEach((line: string, index: number) => {
          doc.text(line, margin + 15, y + (index * 13));
        });

        y += (lines.length * 13) + 3;
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.text('Inga specifika moment registrerade.', margin, y);
      y += 16;
    }

    checkPageOffset(60);
    y += 15;
    doc.setDrawColor(229, 229, 229);
    doc.line(margin, y, margin + contentWidth, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);

    if (isPassed) {
      doc.text('Stort grattis till ditt godkända körkortsprov!', margin, y);
      y += 14;
      doc.text('Kör försiktigt ute på vägarna!', margin, y);
    } else {
      doc.text('Det är viktigt att du tränar mer innan du genomför ditt nästa körprov.', margin, y);
      y += 14;
      doc.text('Välkommen åter!', margin, y);
    }

    const timestampVal = new Date().toISOString().slice(0, 10);
    const filename = `Korprovsresultat_${state.properties.studentName?.replace(/\s+/g, '_') || 'Protokoll'}_${timestampVal}.pdf`;
    doc.save(filename);
  };

  const handleComplete = () => {
    saveTest();
    navigate('/');
  };

  const licenseType = state.properties.licenseType || 'B';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  
  // Rule checks
  const isSafetyCheckRequired = [...HEAVY_LICENSES, 'BE', 'B96'].includes(licenseType);
  const isSafetyCheckPassed = isSafetyCheckRequired 
    ? state.result.safetyCheckResult === 'Godkänt' 
    : true;
  
  const isFailed = state.result.drivingResult === 'Underkänt' || (isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt');
  const isPassed = state.result.drivingResult === 'Godkänt' && isSafetyCheckPassed;

  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;

  // New High-Fidelity ProvProtokoll Vector Logo with protective shield, vehicle array, and custom typography
  const ProvProtokollLogo = () => (
    <div className="flex flex-col items-start select-none" style={{ width: '230px' }}>
      <AppLogo variant="full" className="origin-left" />
    </div>
  );

  return (
    <div className="bg-[#f0f2f5] min-h-screen py-4 sm:py-8 print:bg-white print:py-0 print:p-0 w-full text-black font-sans leading-normal">
      
      {/* Officiell utskriftsmall för PDF / Skriv ut (syns bara vid utskrift) */}
      <div className="hidden print:block w-full bg-white print:m-0 print:p-0">
        <OfficialPrintLayout />
      </div>

      {/* Dynamic top tool-bar to match standalone Web App wrapper (hidden during printing) */}
      <div className="max-w-[730px] mx-auto mb-4 flex flex-col gap-3 print:hidden px-3">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/korprov/resultat')} 
            className="rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 text-sm shadow-none"
          >
            Tillbaka till Beslut
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrint} 
              className="bg-white rounded-xl px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 shadow-none text-sm font-semibold"
            >
              <span>Skriv ut</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleDownloadPDF} 
              className="bg-white rounded-xl px-4 py-2 border border-teal-300 text-teal-700 hover:bg-teal-50 shadow-none text-sm font-semibold flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Hämta PDF</span>
            </Button>
            
            <Button 
              onClick={handleComplete} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent rounded-xl px-5 py-2 shadow-sm font-bold text-sm transition-all"
            >
              Spara & Slutför
            </Button>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex border border-gray-200 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('beslut')}
            className={`flex-1 py-3 px-2 text-center font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-1.5 transition-all rounded-lg ${
              activeTab === 'beslut'
                ? 'bg-red-50 text-[#DD1D25]'
                : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span>Digitalt Provprotokoll</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 px-2 text-center font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-1.5 transition-all rounded-lg ${
              activeTab === 'email'
                ? 'bg-red-50 text-[#DD1D25]'
                : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span>Mottagarens E-post</span>
          </button>
        </div>
      </div>

      {/* Main Document Canvas */}
      <div 
        className="max-w-[730px] mx-auto bg-white shadow-lg border border-gray-300 print:hidden p-4 sm:p-5 text-black relative"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        
        {/* Email mock helper view */}
        {activeTab === 'email' && (
          <div className="mb-4 border border-gray-200 bg-gray-50 p-4 rounded-none space-y-1 text-xs text-gray-700 print:hidden" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Från:</span>
              <span className="text-gray-950 font-semibold">Digitalt Provprotokoll &lt;noreply@provprotokoll.se&gt;</span>
            </div>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Till:</span>
              <span className="text-blue-600 font-medium">{state.properties.email || 'kandidat@exempel.se'}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Datum:</span>
              <span className="text-gray-800">{state.properties.testDate || new Date().toLocaleDateString('sv-SE')} – 16:45</span>
            </div>
            <div className="flex">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Ämne:</span>
              <span className="text-black font-bold text-[12px]">Resultat på ditt körprov – {state.properties.testType || 'Körprov'} ({licenseType})</span>
            </div>
            <div className="pt-2 pb-1 border-t border-gray-200 text-gray-800 text-xs leading-relaxed space-y-2">
              <p>Hej!</p>
              <p>Här kommer beslutet för ditt nyligen genomförda körprov. Provresultat och fullständigt protokoll finner du i dokumentet nedan.</p>
              <p>Med vänlig hälsning,<br /><span className="font-bold">Digitalt Provprotokoll</span></p>
              <div className="h-px bg-gray-300 my-2" />
            </div>
          </div>
        )}

        {/* TRV Style Document Wrapper */}
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', width: '220px' }}>
                  <ProvProtokollLogo />
                </td>
                <td></td>
                <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                  <div className="print:hidden text-sm flex items-center gap-2 justify-end font-bold">
                    <button 
                      onClick={handleDownloadPDF}
                      type="button"
                      className="text-[#008099] hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
                    >
                      Spara som PDF
                    </button>
                    <span className="text-gray-300">|</span>
                    <button 
                      onClick={handlePrint}
                      type="button"
                      className="text-[#c40000] hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
                    >
                      Skriv ut
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <div style={{ marginTop: '30px' }}>
                    <h1 style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '18pt', fontWeight: 'bold', letterSpacing: '-0.01em', margin: '0 0 10px 0' }} className="text-black">
                      Körprovsresultat
                    </h1>
                    
                    <table className="w-full" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10pt', borderCollapse: 'collapse', marginTop: '10px' }}>
                      <tbody>
                        <tr>
                          <td style={{ paddingBottom: '8px', width: '50%', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '10px', color: '#555555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }} className="resultHeaderLabel">Namn:</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{state.properties.studentName || 'Saknas'}</div>
                          </td>
                          <td style={{ paddingBottom: '8px', width: '50%', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '10px', color: '#555555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }} className="resultHeaderLabel">Personnummer:</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{state.properties.personalNumber || 'Saknas'}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingBottom: '8px', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '10px', color: '#555555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }} className="resultHeaderLabel">Provtyp:</div>
                            <div style={{ fontSize: '14px', color: '#000000' }}>Körprov {licenseType}</div>
                          </td>
                          <td style={{ paddingBottom: '8px', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '10px', color: '#555555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }} className="resultHeaderLabel">Provdatum:</div>
                            <div style={{ fontSize: '14px', color: '#000000' }}>{state.properties.testDate || 'Saknas'}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingBottom: '8px', verticalAlign: 'top' }} colSpan={2}>
                            <div style={{ fontSize: '10px', color: '#555555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }} className="resultHeaderLabel">Provförrättare:</div>
                            <div style={{ fontSize: '14px', color: '#000000' }}>{state.properties.examiner || 'Saknas'}</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '10.5pt', marginTop: '20px', marginBottom: '12px', lineHeight: '1.3' }}>
            <span style={{ fontWeight: 'bold' }}>Behörighetsinformation</span>
            <br />
            {isPassed ? (
              <span style={{ color: '#000000', fontWeight: 'bold' }}>
                Behörighet uppnådd: {licenseType}
              </span>
            ) : (
              <span style={{ color: '#000000' }}>Ingen behörighet uppnådd.</span>
            )}
          </div>

          {/* Results table in clean layout matching exact template */}
          <div style={{ marginTop: '12px', marginBottom: '12px' }} className="resultBody">
            <table style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10.5pt', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ paddingRight: '50px', fontWeight: 'bold', paddingBottom: '4px' }}>Prov</td>
                  <td style={{ fontWeight: 'bold', paddingBottom: '4px' }}>Resultat</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '50px', color: '#000000', paddingTop: '4px', paddingBottom: '4px' }}>Körning</td>
                  <td style={{ 
                    fontWeight: 'bold', 
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    color: state.result.drivingResult === 'Godkänt' ? '#107C41' : '#C80018' 
                  }}>
                    {state.result.drivingResult || 'Underkänt'}
                  </td>
                </tr>
                {isSafetyCheckRequired && (
                  <tr>
                    <td style={{ paddingRight: '50px', color: '#000000', paddingTop: '4px', paddingBottom: '4px' }}>Säkerhetskontroll</td>
                    <td style={{ 
                      fontWeight: 'bold', 
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      color: state.result.drivingResult === 'Underkänt'
                        ? '#000000'
                        : state.result.safetyCheckResult === 'Godkänt' 
                          ? '#107C41' 
                          : state.result.safetyCheckResult === 'Underkänt'
                            ? '#C80018'
                            : '#000000'
                    }}>
                      {state.result.drivingResult === 'Underkänt'
                        ? '-'
                        : (state.result.safetyCheckResult || '-')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: '9.5pt', lineHeight: '1.35', color: '#444444', marginTop: '12px', marginBottom: '12px' }}>
            Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.
            <br />
            Här ser du ditt resultat inom provets olika ämnesområden.
          </div>

          {/* Large dynamic outcome heading exactly as text, matching exact Trafikverket spelling and color red */}
          <div style={{ marginTop: '18px', marginBottom: '18px' }}>
            {state.result.drivingResult === 'Godkänt' ? (
              <>
                <h2 style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14pt', fontWeight: 'bold', color: '#107C41', margin: '0 0 10px 0' }}>
                  Din körning är godkänd.
                </h2>
                {isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' && (
                  <h2 style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14pt', fontWeight: 'bold', color: '#107C41', margin: '10px 0' }}>
                    Din säkerhetskontroll är godkänd.
                  </h2>
                )}
              </>
            ) : (
              <h2 style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14pt', fontWeight: 'bold', color: 'red', margin: '0 0 10px 0' }}>
                Din körning är underkänd.
              </h2>
            )}

            {isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt' && state.result.drivingResult !== 'Underkänt' && (
              <h2 style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14pt', fontWeight: 'bold', color: 'red', margin: '10px 0' }}>
                Din säkerhetskontroll är underkänd.
              </h2>
            )}
          </div>

          {/* Underkänd specifications */}
          {isFailed ? (
            <div className="space-y-4 mt-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
              
              {/* PRIMARY FAILURE BLOCK WITH TRANSPARENT RED BORDER */}
              {state.result.drivingResult === 'Underkänt' && drivingFail && drivingFail.primaryCause.area && (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: '#000000', marginBottom: '3px' }}>Grundorsak till underkännandet är:</div>
                  <div 
                    style={{ 
                      border: '3px #C0504D solid', 
                      backgroundColor: 'transparent',
                      padding: '5px', 
                      marginTop: '5px',
                      marginBottom: '10px' 
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: '#000000', marginBottom: '5px' }}>{drivingFail.primaryCause.area}</div>
                    <div style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif', marginBottom: '3px' }}>
                      Din körning visar brister i att:
                    </div>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '18px', marginTop: '2px', marginBottom: '0' }} className="space-y-0.5">
                      {drivingFail.primaryCause.deficiencies.map((d, i) => (
                        <li key={i} style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 'normal' }}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* CONSEQUNCE BLOCKS IN TRANSPARENT ORANGE BORDER */}
              {state.result.drivingResult === 'Underkänt' && drivingFail && drivingFail.consequences.length > 0 && (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '10.5pt', marginTop: '15px', marginBottom: '3px' }}>Detta får konsekvenser på:</div>
                  {drivingFail.consequences.map((cons) => (
                    <div 
                      key={cons.id} 
                      style={{ 
                        border: '3px #F79646 solid', 
                        backgroundColor: 'transparent',
                        padding: '5px', 
                        marginTop: '5px',
                        marginBottom: '10px' 
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: '#000000', marginBottom: '5px' }}>{cons.area}</div>
                      <div style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif', marginBottom: '3px' }}>
                        Din körning visar brister i att:
                      </div>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '18px', marginTop: '2px', marginBottom: '0' }} className="space-y-0.5">
                        {cons.deficiencies.map((d, i) => (
                          <li key={i} style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 'normal' }}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* SAFETY CHECK SPECIFIC FAILS */}
              {state.result.safetyCheckResult === 'Underkänt' && safetyFail && safetyFail.primaryCause.area && (
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: '#000000', marginBottom: '3px' }}>Grundorsak till underkännandet är:</div>
                  <div 
                    style={{ 
                      border: '3px #C0504D solid', 
                      backgroundColor: 'transparent',
                      padding: '5px', 
                      marginTop: '5px',
                      marginBottom: '10px' 
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: '#000000', marginBottom: '5px' }}>{safetyFail.primaryCause.area}</div>
                    <div style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif', marginBottom: '3px' }}>
                      Din säkerhetskontroll visar brister i att:
                    </div>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '18px', marginTop: '2px', marginBottom: '0' }} className="space-y-0.5">
                      {safetyFail.primaryCause.deficiencies.map((d, i) => (
                        <li key={i} style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 'normal' }}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Situations */}
              {drivingFail && drivingFail.situations.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '10.5pt', marginBottom: '3px', color: '#000000' }}>Brister har visat sig i följande situationer:</div>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '18px', marginTop: '2px' }} className="space-y-0.5">
                    {drivingFail.situations.map((sit, idx) => (
                      <li key={idx} style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 'normal' }}>{sit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {state.result.interventionOccurred && (
                <div style={{ marginTop: '15.5px', fontWeight: 'bold', fontSize: '10.5pt', color: '#C80018', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Ingripande har förekommit
                </div>
              )}

              {/* Tested requirements list */}
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '10px', marginTop: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                <span style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#000000' }}>Följande provinnehåll har ingått i ditt körprov:</span>
                {state.includedTestItems && state.includedTestItems.length > 0 ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '18px', marginTop: '4px' }} className="flex flex-col gap-1">
                    {state.includedTestItems.map((item, index) => (
                      <li key={index} style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif' }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666666', fontStyle: 'italic', marginTop: '4px', fontSize: '10.5pt' }}>Inga specifika moment registrerade.</p>
                )}
              </div>

              {/* Encouragement text */}
              <div style={{ marginTop: '50px', borderTop: '1px solid #e5e5e5', paddingTop: '10px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10.5pt', lineHeight: '1.4', color: '#000000' }}>
                Det är viktigt att du tränar mer innan du genomför ditt nästa körprov.
                <br />
                Välkommen åter!
              </div>

            </div>
          ) : (
            /* Passed Layout: simple, compact single column since height is tiny */
            <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10.5pt' }} className="mt-3 text-black space-y-4">
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '10px' }}>
                <span style={{ fontSize: '10.5pt', fontWeight: 'bold' }}>Följande provinnehåll har ingått i ditt körprov:</span>
                {state.includedTestItems && state.includedTestItems.length > 0 ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '4px' }} className="flex flex-col gap-1">
                    {state.includedTestItems.map((item, index) => (
                      <li key={index} style={{ fontSize: '10.5pt', color: '#111111', fontFamily: 'Arial, Helvetica, sans-serif' }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666666', fontStyle: 'italic', marginTop: '4px', fontSize: '10.5pt' }}>Inga specifika moment registrerade.</p>
                )}
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid #e5e5e5', paddingTop: '10px', fontSize: '10.5pt', lineHeight: '1.4', color: '#000000' }}>
                Stort grattis till ditt godkända körkortsprov!
                <br />
                Kör försiktigt ute på vägarna!
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
