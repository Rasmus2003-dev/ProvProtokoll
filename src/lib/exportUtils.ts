import { SavedProtocolRow } from './supabase';
import { AppState } from '../types';

export interface DailySummaryStats {
  date: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  averageMinutes: number;
  licenseCounts: Record<string, number>;
  items: SavedProtocolRow[];
}

export function calculateDailyStats(
  protocols: SavedProtocolRow[],
  targetDate: string = new Date().toISOString().split('T')[0],
  evaluateIsPassed: (item: any) => boolean
): DailySummaryStats {
  const daily = protocols.filter(p => {
    const pDate = p.created_at ? p.created_at.split('T')[0] : p.full_state?.properties?.testDate;
    return pDate === targetDate;
  });

  const total = daily.length;
  const passed = daily.filter(p => evaluateIsPassed({
    testType: p.test_type,
    licenseType: p.license_type,
    drivingResult: p.driving_result,
    safetyResult: p.safety_result
  })).length;
  const failed = total - passed;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  // Beräkna tidsåtgång
  let totalMinutes = 0;
  let timedCount = 0;
  const licenseCounts: Record<string, number> = {};

  daily.forEach(p => {
    const lic = p.license_type || 'B';
    licenseCounts[lic] = (licenseCounts[lic] || 0) + 1;

    // Om körtid finns sparad
    if (p.full_state?.testStartTime) {
      const start = new Date(p.full_state.testStartTime).getTime();
      const end = p.created_at ? new Date(p.created_at).getTime() : 0;
      if (end > start) {
        const diffMin = Math.round((end - start) / 60000);
        if (diffMin > 10 && diffMin < 120) {
          totalMinutes += diffMin;
          timedCount++;
        }
      }
    }
  });

  // Standard schablon (45 min) om inga mätta tider fanns
  const averageMinutes = timedCount > 0 ? Math.round(totalMinutes / timedCount) : (total > 0 ? 45 : 0);

  return {
    date: targetDate,
    total,
    passed,
    failed,
    passRate,
    averageMinutes,
    licenseCounts,
    items: daily
  };
}

/**
 * Exporterar protokoll till semikolonavgränsad CSV med UTF-8 BOM för full kompatibilitet med svenska tecken i Excel.
 */
export function exportProtocolsToCsv(
  protocols: SavedProtocolRow[],
  evaluateIsPassed: (item: any) => boolean
) {
  const headers = [
    'Datum',
    'Kandidatnamn',
    'Personnummer',
    'Behörighet',
    'Växellåda',
    'Provtyp',
    'Körningsresultat',
    'Säkerhetskontroll',
    'Slutresultat',
    'Provförrättare',
    'Grundorsak (brister)',
    'Anteckningar'
  ];

  const rows = [headers.join(';')];

  protocols.forEach(p => {
    const s = p.full_state;
    const isPassed = evaluateIsPassed({
      testType: p.test_type,
      licenseType: p.license_type,
      drivingResult: p.driving_result,
      safetyResult: p.safety_result
    });

    const drivingCause = s?.result?.drivingFailure?.primaryCause?.area || '';
    const safetyCause = s?.result?.safetyCheckFailure?.primaryCause?.area || '';
    const causeList = [
      ...(s?.result?.drivingFailure?.primaryCause?.deficiencies || []),
      ...(s?.result?.safetyCheckFailure?.primaryCause?.deficiencies || [])
    ];
    const causeString = [drivingCause, safetyCause, ...causeList].filter(Boolean).join(', ');
    const notesClean = (s?.testNotes || '').replace(/[\r\n]+/g, ' ');

    const dateVal = p.created_at ? p.created_at.split('T')[0] : (s?.properties?.testDate || '');
    const cleanPnr = p.personal_number || s?.properties?.personalNumber || '';

    const cols = [
      dateVal,
      `"${(p.student_name || s?.properties?.studentName || '').replace(/"/g, '""')}"`,
      `"${cleanPnr}"`,
      p.license_type || s?.properties?.licenseType || '',
      p.transmission || s?.properties?.transmission || '',
      p.test_type || s?.properties?.testType || 'Körprov',
      p.driving_result || s?.result?.drivingResult || '',
      p.safety_result || s?.result?.safetyCheckResult || '',
      isPassed ? 'Godkänt' : 'Underkänt',
      `"${(p.examiner || s?.properties?.examiner || '').replace(/"/g, '""')}"`,
      `"${causeString.replace(/"/g, '""')}"`,
      `"${notesClean.replace(/"/g, '""')}"`
    ];

    rows.push(cols.join(';'));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `korprov_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Öppnar ett utskriftsfönster med en ren, officiell dagsrapport sammanställning.
 */
export function printDailyReport(stats: DailySummaryStats, inspectorName?: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const licenseSummaryText = Object.entries(stats.licenseCounts)
    .map(([lic, count]) => `${lic}: ${count} st`)
    .join(', ') || 'Inga prov registrerade';

  const rowsHtml = stats.items.length > 0 ? stats.items.map((item, idx) => {
    const isPass = item.driving_result === 'Godkänt';
    const drivingCause = item.full_state?.result?.drivingFailure?.primaryCause?.area || '';
    const safetyCause = item.full_state?.result?.safetyCheckFailure?.primaryCause?.area || '';
    const causeText = [drivingCause, safetyCause].filter(Boolean).join(' / ') || '-';

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 8px 10px; font-family: monospace;">0${idx + 1}</td>
        <td style="padding: 8px 10px; font-weight: bold;">${item.student_name}</td>
        <td style="padding: 8px 10px; font-family: monospace;">${item.personal_number}</td>
        <td style="padding: 8px 10px; font-weight: bold;">${item.license_type} (${item.transmission || 'Manuell'})</td>
        <td style="padding: 8px 10px;">${item.test_type || 'Körprov'}</td>
        <td style="padding: 8px 10px; font-weight: bold; color: ${isPass ? '#15803d' : '#b91c1c'};">
          ${isPass ? 'Godkänt' : 'Underkänt'}
        </td>
        <td style="padding: 8px 10px; color: #64748b; font-size: 11px;">${causeText}</td>
      </tr>
    `;
  }).join('') : `
    <tr>
      <td colspan="7" style="padding: 24px; text-align: center; color: #94a3b8; font-style: italic;">
        Inga prov registrerade för detta datum.
      </td>
    </tr>
  `;

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <title>Dagsrapport ProvProtokoll - ${stats.date}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #002f6c;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 22px;
      font-weight: 900;
      color: #002f6c;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .stat-val {
      font-size: 22px;
      font-weight: 900;
      color: #002f6c;
    }
    .stat-label {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      color: #64748b;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #f1f5f9;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #334155;
      border-bottom: 2px solid #cbd5e1;
    }
    .signature-area {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #475569;
      border-top: 1px dashed #cbd5e1;
      padding-top: 20px;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; size: A4 landscape; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">Dagsrapport Körprov</h1>
      <div class="subtitle">ProvProtokoll · Daglig sammanställning över genomförda förarprov</div>
    </div>
    <div style="text-align: right; font-size: 12px;">
      <div><strong>Datum:</strong> ${stats.date}</div>
      <div><strong>Provförrättare:</strong> ${inspectorName || 'Trafikverket'}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-val">${stats.total}</div>
      <div class="stat-label">Genomförda prov</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #16a34a;">${stats.passRate}%</div>
      <div class="stat-label">Godkännandegrad</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${stats.passed} / ${stats.failed}</div>
      <div class="stat-label">Godkända / Underkända</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">~${stats.averageMinutes} min</div>
      <div class="stat-label">Genomsnittlig körtid</div>
    </div>
  </div>

  <div style="font-size: 12px; margin-bottom: 12px; color: #475569;">
    <strong>Fördelning per behörighet:</strong> ${licenseSummaryText}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">Nr</th>
        <th>Kandidat</th>
        <th>Personnummer</th>
        <th>Behörighet</th>
        <th>Provtyp</th>
        <th>Resultat</th>
        <th>Anmärkning / Grundorsak</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signature-area">
    <div>
      Utskriven: ${new Date().toLocaleString('sv-SE')}
    </div>
    <div style="text-align: right;">
      Underskrift Provförrättare: _________________________________________
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
