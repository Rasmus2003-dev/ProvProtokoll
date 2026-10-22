import { AppState } from '../types';
import { sortByCatalog } from '../screens/Korprov/data/failureData';

// Protokollayout för kandidatens resultat.
// 'klassisk' = grundorsak + konsekvenser i färgade ramar (tidigare utformning)
// 'ny'       = Trafikverkets nya utformning: "Orsaker till underkännandet" med
//              "Du måste bli bättre på:" och "Detta bedömdes i ditt körprov"
export type ProtocolLayout = 'klassisk' | 'ny';

const PREF_KEY = 'provprotokoll-protocol-layout';

// Inspektörens val gäller tills vidare (testperiod) – sparas på enheten
export function getLayoutPreference(): ProtocolLayout {
  try {
    return window.localStorage.getItem(PREF_KEY) === 'ny' ? 'ny' : 'klassisk';
  } catch {
    return 'klassisk';
  }
}

export function setLayoutPreference(layout: ProtocolLayout) {
  try {
    window.localStorage.setItem(PREF_KEY, layout);
  } catch { /* ignoreras */ }
}

// Varje prov bär sin egen layout, så att historik och utskrift senare
// visas som när protokollet skapades
export function isNewLayout(state: AppState): boolean {
  return state.protocolLayout === 'ny';
}

const HEAVY_WITH_SAFETY = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'BE'];

export interface ResultHeading {
  text: string;
  passed: boolean;
}

// Rubrikerna i ny layout: ett besked per delprov som faktiskt bedömts, så att
// "Din säkerhetskontroll är underkänd." syns även när körningen också är underkänd
export function resultHeadings(state: AppState): ResultHeading[] {
  const testType = state.properties.testType;
  const isOmprovSakerhet = testType === 'Omprov säkerhetskontroll';
  const isOmprovKorning = testType === 'Omprov körning';
  const safetyRequired = HEAVY_WITH_SAFETY.includes(state.properties.licenseType || '');
  const headings: ResultHeading[] = [];

  const drivingFailed = !isOmprovSakerhet && state.result.drivingResult === 'Underkänt';
  if (!isOmprovSakerhet) {
    // Avbruten körning kan inte kallas godkänd
    if (state.result.drivingResult === 'Godkänt' && !state.result.testAborted) headings.push({ text: 'Din körning är godkänd.', passed: true });
    if (state.result.drivingResult === 'Underkänt') headings.push({ text: 'Din körning är underkänd.', passed: false });
  }
  // Är körningen underkänd står bara det – säkerhetskontrollen redovisas som "-"
  if (safetyRequired && !isOmprovKorning && !drivingFailed) {
    if (state.result.safetyCheckResult === 'Godkänt') headings.push({ text: 'Din säkerhetskontroll är godkänd.', passed: true });
    if (state.result.safetyCheckResult === 'Underkänt') headings.push({ text: 'Din säkerhetskontroll är underkänd.', passed: false });
  }
  return headings;
}

// Formaterar rubriken så att "underkänd." / "godkänd." aldrig hamnar ensam på en ny rad
// (typografisk änka / föräldralöst ord). "Din säkerhetskontroll" hålls ihop och "är underkänd." hålls ihop.
export function formatResultHeadingHtml(text: string): string {
  if (text.includes('säkerhetskontroll')) {
    const isPassed = text.includes('godkänd');
    const punct = text.endsWith('!') ? '!' : '.';
    return `<span style="white-space: nowrap;">Din säkerhetskontroll</span> <span style="white-space: nowrap;">är&nbsp;${isPassed ? 'godkänd' : 'underkänd'}${punct}</span>`;
  }
  if (text.includes('körning')) {
    const isPassed = text.includes('godkänd');
    const punct = text.endsWith('!') ? '!' : '.';
    return `<span style="white-space: nowrap;">Din körning</span> <span style="white-space: nowrap;">är&nbsp;${isPassed ? 'godkänd' : 'underkänd'}${punct}</span>`;
  }
  return text.replace(/\s(underkänd|godkänd)(\.?|!?)$/i, '&nbsp;$1$2');
}

// Vilka delprov som faktiskt ingår i provet. Gamla uppgifter (t.ex. en säkerhetskontroll
// kvar efter byte från D till A) räknas inte.
export function relevantParts(state: AppState) {
  const testType = state.properties.testType;
  const safetyRequired = HEAVY_WITH_SAFETY.includes(state.properties.licenseType || '');
  const driving = testType !== 'Omprov säkerhetskontroll';
  return {
    driving,
    // Underkänd körning: säkerhetskontrollen redovisas inte i protokollet
    safety: safetyRequired && testType !== 'Omprov körning' && !(driving && state.result.drivingResult === 'Underkänt'),
  };
}

/** Säkerhetskontrollens cell i resultattabellen: "-" när körningen är underkänd */
export function safetyCellText(state: AppState): string {
  const drivingFailed = state.properties.testType !== 'Omprov säkerhetskontroll' && state.result.drivingResult === 'Underkänt';
  return drivingFailed ? '-' : (state.result.safetyCheckResult || '-');
}

// Situationer där brister visats – bara från delprov som ingår och är underkända
export function failedSituations(state: AppState): string[] {
  const parts = relevantParts(state);
  return Array.from(new Set([
    ...(parts.driving && state.result.drivingResult === 'Underkänt' ? state.result.drivingFailure?.situations || [] : []),
    ...(parts.safety && state.result.safetyCheckResult === 'Underkänt' ? state.result.safetyCheckFailure?.situations || [] : []),
  ]));
}

// Provtypen som kandidaten ser i protokollet. Omprov visas bara som
// "Körprov <behörighet>" – att det är ett omprov är inspektörens uppgift.
export function protocolTestTypeLabel(licenseType: string | undefined, testType: string | undefined): string {
  const license = licenseType || 'B';
  const assessment = Boolean(testType?.includes('Bedömningsprov') || testType?.includes('Testprov'));
  if (license === 'B96') return assessment ? 'Bedömningsprov Släpvagn' : 'Släpvagn';
  return assessment ? `Bedömningsprov (${license})` : `Körprov ${license}`;
}

// Avbrutet prov – samma text i utskrift, mejl, förhandsvisning och översättning
export const ABORTED_TITLE = 'Provet avbröts i förtid.';
export const ABORTED_TEXT = 'Provet avbröts innan alla delar hann genomföras.';

// Tabellcellen för körningen när provet avbrutits
export function abortedDrivingText(drivingResult: string | null): string {
  return drivingResult === 'Underkänt' ? 'Underkänt (avbrutet)' : 'Avbrutet';
}

// Länk som översätter hela resultatet (svenska → engelska, språk kan bytas på sidan)
export function translationUrl(lines: string[]): string {
  const text = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return `https://translate.google.com/?sl=sv&tl=en&op=translate&text=${encodeURIComponent(text)}`;
}

// Hela resultatet som text i samma ordning som protokollet, för översättning
export function resultTranslationLines(state: AppState, intro: string[], closing: string[]): string[] {
  const situations = failedSituations(state);
  const areas = collectImprovementAreas(state);
  const interventions = state.result.interventionSituations || [];
  const lines: string[] = [
    ...intro, '',
    ...(state.result.testAborted ? [ABORTED_TITLE, ABORTED_TEXT, ''] : []),
    ...resultHeadings(state).map(h => h.text),
  ];

  if (areas.length > 0) {
    lines.push('', 'Orsaker till underkännandet:', 'Du måste bli bättre på:');
    areas.forEach(a => { lines.push(`• ${a.area}`); a.deficiencies.forEach(d => lines.push(`  - ${d}`)); });
  }
  if (situations.length > 0) {
    lines.push('', 'Du har visat brister i dessa situationer:', ...situations.map(s => `• ${s}`));
  }
  if (state.result.interventionOccurred) {
    lines.push('', ...(interventions.length > 0
      ? ['Ingripande har skett i följande situationer:', ...interventions.map(s => `• ${s}`)]
      : ['Ingripande har förekommit.']));
  }
  if ((state.includedTestItems || []).length > 0) {
    lines.push('', 'Detta bedömdes i ditt körprov:', ...state.includedTestItems.map(s => `• ${s}`));
  }
  lines.push('', ...closing);
  return lines;
}

export interface ImprovementArea {
  area: string;
  deficiencies: string[];
  // Området valdes som grundorsak (inte bara som konsekvens)
  isPrimary: boolean;
}

// Samlar grundorsak och konsekvensområden (körning och säkerhetskontroll)
// till en lista med kompetensområden, i den ordning de valts. Samma område
// förekommer bara en gång, bristerna slås ihop och sorteras i listans ordning.
export function collectImprovementAreas(state: AppState): ImprovementArea[] {
  const parts = relevantParts(state);
  const byArea = new Map<string, Set<string>>();
  const primaryAreas = new Set<string>();

  const add = (area: string | undefined, deficiencies: string[] | undefined, isPrimary = false) => {
    if (!area) return;
    if (!byArea.has(area)) byArea.set(area, new Set());
    if (isPrimary) primaryAreas.add(area);
    (deficiencies || []).forEach(d => byArea.get(area)!.add(d));
  };

  const failures = [
    parts.driving && state.result.drivingResult === 'Underkänt' ? state.result.drivingFailure : null,
    parts.safety && state.result.safetyCheckResult === 'Underkänt' ? state.result.safetyCheckFailure : null,
  ];
  // Grundorsaker först, därefter konsekvensområden
  failures.forEach(f => add(f?.primaryCause?.area, f?.primaryCause?.deficiencies, true));
  failures.forEach(f => (f?.consequences || []).forEach(c => add(c.area, c.deficiencies)));

  return Array.from(byArea.entries()).map(([area, defs]) => ({
    area,
    deficiencies: sortByCatalog(area, Array.from(defs)),
    isPrimary: primaryAreas.has(area),
  }));
}
