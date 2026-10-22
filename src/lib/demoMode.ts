import type { AppState, ElevRecord } from '../types';
import type { SavedProtocolRow } from './supabase';
import { TEST_CONTENT } from '../data/testContentCatalog';

// Demoinspektör: en påhittad arbetsdag med 30 prov i olika behörigheter,
// förstaprov och omprov med tidigare underkända protokoll. Allt är fiktivt
// och ligger bara på enheten – i demoläge skickas ingen data till molnet.
// Den riktiga datan sparas undan och läggs tillbaka när demoläget avslutas.

const FLAG_KEY = 'provprotokoll-demo-mode';
const BACKUP_KEY = 'provprotokoll-demo-backup';

// Lokal data som byts ut i demoläge
const DATA_KEYS = [
  'provprotokoll_elevregister',
  'provprotokoll-test-history',
  'provprotokoll-sync-queue',
  'provprotokoll_saved_db',
  'provprotokoll-active-state',
  'provprotokoll_vagtrafikregister',
];

export const DEMO_INSPECTOR = {
  name: 'Lena Ström',
  depot: 'Förarprov Sundsvall (demo)',
};

export function isDemoMode(): boolean {
  try {
    return localStorage.getItem(FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

export function enterDemoMode() {
  if (isDemoMode()) return;
  const backup: Record<string, string | null> = {};
  DATA_KEYS.forEach(key => { backup[key] = localStorage.getItem(key); });
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));

  const { elever, protocols, history } = buildDemoDay();
  DATA_KEYS.forEach(key => localStorage.removeItem(key));
  localStorage.setItem('provprotokoll_elevregister', JSON.stringify(elever));
  localStorage.setItem('provprotokoll_saved_db', JSON.stringify(protocols));
  localStorage.setItem('provprotokoll-test-history', JSON.stringify(history));
  localStorage.setItem(FLAG_KEY, '1');
  // Ladda om så att hela appen läser in demodagen på nytt
  window.location.assign('/korprov/start');
}

export function exitDemoMode() {
  let backup: Record<string, string | null> = {};
  try {
    backup = JSON.parse(localStorage.getItem(BACKUP_KEY) || '{}');
  } catch { /* tom säkerhetskopia – rensa bara demodatan */ }
  DATA_KEYS.forEach(key => {
    const value = backup[key];
    if (typeof value === 'string') localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  });
  localStorage.removeItem(BACKUP_KEY);
  localStorage.removeItem(FLAG_KEY);
  window.location.assign('/korprov/start');
}

/** Startar om demodagen från början (alla prov inbokade igen) */
export function resetDemoDay() {
  const { elever, protocols, history } = buildDemoDay();
  localStorage.setItem('provprotokoll_elevregister', JSON.stringify(elever));
  localStorage.setItem('provprotokoll_saved_db', JSON.stringify(protocols));
  localStorage.setItem('provprotokoll-test-history', JSON.stringify(history));
  localStorage.removeItem('provprotokoll-sync-queue');
  localStorage.removeItem('provprotokoll-active-state');
  window.location.assign('/korprov/start');
}

// ---------------------------------------------------------------------------
// Demodagen
// ---------------------------------------------------------------------------

// Fiktiva testpersonnummer enligt Skatteverkets standard (dag 61–91 / +60 dag) med korrekt Luhn-kontrollsiffra
function pnr(date: string, serial: number): string {
  const y = date.slice(0, 4);
  const m = date.slice(4, 6);
  const d = parseInt(date.slice(6, 8), 10);
  const testDay = d > 60 ? d : d + 60; // Skatteverkets testformat (samordningsdag)
  const fullDate = `${y}${m}${String(testDay).padStart(2, '0')}`;

  const nine = `${fullDate.slice(2)}${String(serial).padStart(3, '0')}`;
  const sum = nine.split('').map(Number).reduce((acc, digit, i) => {
    let v = digit * (i % 2 === 0 ? 2 : 1);
    if (v > 9) v -= 9;
    return acc + v;
  }, 0);
  const check = (10 - (sum % 10)) % 10;
  return `${fullDate}-${String(serial).padStart(3, '0')}${check}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

const SAFETY_LICENSES = ['BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
const PAST_EXAMINERS = ['Lena Ström', 'Johan Ekdahl', 'Sara Lindqvist', 'Mikael Berg'];

interface Failure {
  area: string;
  deficiencies: string[];
  consequences?: { area: string; deficiencies: string[] }[];
  situations: string[];
}

interface PastTest {
  daysAgo: number;
  testType?: string;
  layout?: 'klassisk' | 'ny';
  driving?: Failure | 'pass' | null;   // null = körningen genomfördes inte
  safety?: Failure | 'pass' | null;
  intervention?: string[];
  aborted?: boolean;
}

interface DemoCandidate {
  time: string;
  name: string;
  born: string;
  license: string;
  transmission?: 'Manuell' | 'Automat';
  testType: string;
  previous?: PastTest[];
  today?: PastTest; // redan genomfört i dag
}

const CANDIDATES: DemoCandidate[] = [
  // Redan genomförda i dag
  { time: '07:00', name: 'Alva Sundberg', born: '20070312', license: 'B', testType: 'Förstaprov', today: { daysAgo: 0, driving: 'pass' } },
  { time: '07:20', name: 'Elias Norén', born: '20060828', license: 'B', transmission: 'Automat', testType: 'Förstaprov',
    today: { daysAgo: 0, driving: { area: 'Trafikregler', deficiencies: ['Iaktta väjningsplikt och stopplikt'], consequences: [{ area: 'Trafiksäkerhet och beteende', deficiencies: ['Visa god uppmärksamhet'] }], situations: ['Gatukorsning'] }, intervention: ['Gatukorsning'] } },
  { time: '07:40', name: 'Wilma Ek', born: '20050419', license: 'A2', testType: 'Förstaprov', today: { daysAgo: 0, driving: 'pass' } },
  { time: '08:00', name: 'Hugo Lindahl', born: '19990204', license: 'C', testType: 'Förstaprov',
    today: { daysAgo: 0, safety: { area: 'Fordonskännedom', deficiencies: ['Identifiera och åtgärda felaktigheter vid säkerhetskontroll'], situations: ['Säkerhetskontroll'] }, driving: null } },
  { time: '08:20', name: 'Saga Brandt', born: '19950709', license: 'BE', testType: 'Omprov säkerhetskontroll',
    previous: [{ daysAgo: 21, driving: 'pass', safety: { area: 'Fordonskännedom', deficiencies: ['Korrekt till- och frånkoppling av släpvagn (bromsuttag, vändskiva/dragstång, katastrofbromswire)'], situations: ['Säkerhetskontroll'] } }],
    today: { daysAgo: 0, testType: 'Omprov säkerhetskontroll', safety: 'pass' } },

  // Kvar att genomföra
  { time: '08:40', name: 'Noah Falk', born: '20061103', license: 'B', testType: 'Omprov körning',
    previous: [{ daysAgo: 24, driving: { area: 'Trafiksäkerhet och beteende', deficiencies: ['Anpassa hastigheten efter de omständigheter som råder', 'Köra med tillräckliga säkerhetsmarginaler'], consequences: [{ area: 'Manövrering', deficiencies: ['Manövrera fordonet mjukt och under kontroll'] }], situations: ['Landsväg', 'Smal/krokig väg'] } }] },
  { time: '09:00', name: 'Ines Wallin', born: '19880516', license: 'D', testType: 'Omprov körning',
    previous: [{ daysAgo: 18, safety: 'pass', driving: { area: 'Manövrering', deficiencies: ['Anpassa till utrymme och hinder', 'Krypkörning och finmanövrering vid parkering och backning'], situations: ['Backning', 'Manövrering och uppställning'] } }] },
  { time: '09:20', name: 'Leo Hedlund', born: '20070121', license: 'B', transmission: 'Automat', testType: 'Förstaprov' },
  { time: '09:40', name: 'Tove Ahl', born: '20040930', license: 'B', testType: 'Omprov',
    previous: [
      { daysAgo: 56, driving: { area: 'Trafikregler', deficiencies: ['Tillämpa regler för cirkulationsplatser och svängar på landsväg'], situations: ['Cirkulationsplats'] } },
      { daysAgo: 20, driving: { area: 'Manövrering', deficiencies: ['Manövrera fordonet mjukt och under kontroll', 'Start i brant lutning utan bakåtrullning eller motorstopp'], consequences: [{ area: 'Trafiksäkerhet och beteende', deficiencies: ['Visa god uppmärksamhet'] }], situations: ['Start i lutning', 'Backning'] }, intervention: ['Start i lutning'] },
    ] },
  { time: '10:00', name: 'Melvin Rask', born: '19971224', license: 'A', testType: 'Förstaprov' },
  { time: '10:20', name: 'Astrid Holmgren', born: '19910302', license: 'CE', testType: 'Omprov säkerhetskontroll',
    previous: [{ daysAgo: 15, driving: 'pass', safety: { area: 'Fordonskännedom', deficiencies: ['Korrekt till- och frånkoppling av släpvagn (bromsuttag, vändskiva/dragstång, katastrofbromswire)', 'Bedömning av lastens surrning och lastsäkerhet (för tunga fordonsklasser/släp)'], situations: ['Säkerhetskontroll'] } }] },
  { time: '10:40', name: 'Oscar Berglund', born: '19860611', license: 'TAXI', transmission: 'Automat', testType: 'Omprov',
    previous: [{ daysAgo: 30, layout: 'ny', driving: { area: 'Passagerarvänlig körning', deficiencies: ['Accelerera och bromsa mjukt och förutsägbart', 'Anpassa hastigheten i kurvor så att sidokrafter minimeras'], situations: ['Passagerarvänlig bromsning', 'Körning mot mål'] } }] },
  { time: '11:00', name: 'Freja Lund', born: '20070605', license: 'B', testType: 'Förstaprov' },
  { time: '11:20', name: 'Axel Nyström', born: '20010817', license: 'C1', testType: 'Förstaprov' },
  { time: '11:40', name: 'Maja Dahl', born: '20060214', license: 'B', transmission: 'Automat', testType: 'Omprov körning',
    previous: [{ daysAgo: 12, aborted: true, driving: { area: 'Trafiksäkerhet och beteende', deficiencies: ['Identifiera risker i olika trafiksituationer och trafikmiljöer'], situations: ['Oskyddade trafikanter'] }, intervention: ['Oskyddade trafikanter'] }] },
  { time: '12:00', name: 'Viggo Sandberg', born: '20110420', license: 'AM', testType: 'Förstaprov' },
  { time: '12:40', name: 'Elsa Karlberg', born: '19830927', license: 'B', testType: 'Bedömningsprov' },
  { time: '13:00', name: 'Anton Wikström', born: '19930118', license: 'DE', testType: 'Förstaprov' },
  { time: '13:20', name: 'Agnes Forsberg', born: '19980803', license: 'B96', testType: 'Omprov',
    previous: [{ daysAgo: 27, safety: 'pass', driving: { area: 'Manövrering', deficiencies: ['Anpassa till utrymme och hinder'], consequences: [{ area: 'Trafiksäkerhet och beteende', deficiencies: ['Anpassa placeringen efter de omständigheter som råder'] }], situations: ['Backning', 'Smal/krokig väg'] } }] },
  { time: '13:40', name: 'Liam Öberg', born: '20080511', license: 'A1', testType: 'Omprov körning',
    previous: [{ daysAgo: 16, driving: { area: 'Trafiksäkerhet och beteende', deficiencies: ['Anpassa placeringen efter de omständigheter som råder'], situations: ['Körfält', 'Cirkulationsplats'] } }] },
  { time: '14:00', name: 'Signe Blom', born: '19960126', license: 'C1E', testType: 'Förstaprov' },
  { time: '14:20', name: 'Gustav Engström', born: '20050722', license: 'B', testType: 'Omprov',
    previous: [{ daysAgo: 22, layout: 'ny', driving: { area: 'Trafiksäkerhet och beteende', deficiencies: ['Visa hänsyn till oskyddade trafikanter', 'Upptäcka och förutse risker i god tid'], consequences: [{ area: 'Trafikregler', deficiencies: ['Lämna företräde vid övergångsställen och cykelpassager'] }], situations: ['Oskyddade trafikanter', 'Möte'] }, intervention: ['Oskyddade trafikanter'] }] },
  { time: '14:40', name: 'Nova Hellström', born: '19940310', license: 'D1', testType: 'Förstaprov' },
  { time: '15:00', name: 'Adam Lindgren', born: '20070909', license: 'B', transmission: 'Automat', testType: 'Förstaprov' },
  { time: '15:20', name: 'Ella Sjöberg', born: '19900404', license: 'CE', transmission: 'Automat', testType: 'Omprov körning',
    previous: [{ daysAgo: 19, safety: 'pass', driving: { area: 'Trafikregler', deficiencies: ['Följa regler vid körfältsbyte, sammanvävning och hinder'], consequences: [{ area: 'Trafiksäkerhet och beteende', deficiencies: ['Uppmärksamhet bakåt vid inbromsning och fältbyte (döda vinkeln & speglar)'] }], situations: ['Motorväg/motortrafikled', 'Körfältsbyte'] } }] },
  { time: '15:40', name: 'William Åberg', born: '20060116', license: 'B', testType: 'Förstaprov' },
  { time: '16:00', name: 'Olivia Strand', born: '19991019', license: 'A', testType: 'Omprov',
    previous: [{ daysAgo: 25, driving: { area: 'Manövrering', deficiencies: ['Manövrera fordonet mjukt och under kontroll', 'Bromsteknik och effektiv bromsning utan onödigt dröjsmål'], situations: ['Lågfart', 'Bromsning'] } }] },
  { time: '16:20', name: 'Lucas Hammar', born: '19870228', license: 'D1E', testType: 'Förstaprov' },
  { time: '16:40', name: 'Ingrid Palm', born: '20050503', license: 'B', testType: 'Omprov körning',
    previous: [{ daysAgo: 14, driving: { area: 'Trafikregler', deficiencies: ['Korrekt tillämpning av stopplikt (stanna helt på stopplinjen)'], situations: ['Gatukorsning'] } }] },
  { time: '17:00', name: 'Hampus Vik', born: '19920814', license: 'TAXI', testType: 'Förstaprov' },
];

// Provmoment från katalogen: de underkända situationerna plus ett urval, i katalogens ordning
function pickItems(license: string, situations: string[], seed: number): string[] {
  const catalog = TEST_CONTENT[license] || TEST_CONTENT.B;
  const picked = new Set(situations.filter(s => catalog.includes(s)));
  if (catalog.includes('Säkerhetskontroll')) picked.add('Säkerhetskontroll');
  for (let i = 0; picked.size < 9 && i < catalog.length; i++) {
    const item = catalog[(seed * 7 + i * 5) % catalog.length];
    picked.add(item);
  }
  return catalog.filter(item => picked.has(item));
}

const emptyFailure = () => ({
  primaryCause: { area: '', deficiencies: [] as string[] },
  consequences: [] as { id: string; area: string; deficiencies: string[] }[],
  situations: [] as string[],
  interventionOccurred: false,
  testAborted: false,
});

function toFailure(f: Failure | 'pass' | null | undefined, intervention: boolean, aborted: boolean) {
  if (!f || f === 'pass') return emptyFailure();
  return {
    primaryCause: { area: f.area, deficiencies: f.deficiencies },
    consequences: (f.consequences || []).map((c, i) => ({ id: `demo-kons-${i}`, ...c })),
    situations: f.situations,
    interventionOccurred: intervention,
    testAborted: aborted,
  };
}

function resultOf(f: Failure | 'pass' | null | undefined): 'Godkänt' | 'Underkänt' | null {
  if (f === undefined || f === null) return null;
  return f === 'pass' ? 'Godkänt' : 'Underkänt';
}

function buildTest(c: DemoCandidate, email: string, personalNumber: string, test: PastTest, index: number): AppState {
  const needsSafety = SAFETY_LICENSES.includes(c.license);
  const testType = test.testType ?? (test.daysAgo === 0 ? c.testType : (index === 0 ? 'Förstaprov' : 'Omprov'));
  // Delprov som inte angetts: godkänt om det ingår, annars inte bedömt
  const driving = test.driving === undefined ? (testType === 'Omprov säkerhetskontroll' ? null : 'pass') : test.driving;
  const safety = test.safety === undefined ? (needsSafety && testType !== 'Omprov körning' ? 'pass' : null) : test.safety;
  const intervention = Boolean(test.intervention?.length);
  const situations = [
    ...(driving && driving !== 'pass' ? driving.situations : []),
    ...(safety && safety !== 'pass' ? safety.situations : []),
  ];
  const testDate = isoDaysAgo(test.daysAgo);

  return {
    properties: {
      studentName: c.name,
      personalNumber,
      email,
      examiner: test.daysAgo === 0 ? DEMO_INSPECTOR.name : PAST_EXAMINERS[(index + c.name.length) % PAST_EXAMINERS.length],
      testDate,
      testType,
      licenseType: c.license,
      transmission: c.transmission || 'Manuell',
      tachograph: 'Med färdskrivare',
    },
    checklist: { identityChecked: true, studentInformed: true, licenseTypeCorrect: true, vehicleCorrect: true, questionsAnswered: true },
    includedTestItems: pickItems(c.license, situations, c.name.length + index),
    result: {
      drivingResult: resultOf(driving),
      safetyCheckResult: resultOf(safety),
      interventionOccurred: intervention,
      interventionSituations: test.intervention || [],
      testAborted: Boolean(test.aborted),
      drivingFailure: toFailure(driving, intervention, Boolean(test.aborted)),
      safetyCheckFailure: toFailure(safety, false, false),
    },
    testStartTime: null,
    testNotes: '',
    protocolLayout: test.layout ?? 'klassisk',
  } as AppState;
}

function buildDemoDay(): { elever: ElevRecord[]; protocols: SavedProtocolRow[]; history: AppState[] } {
  const today = isoDaysAgo(0);
  const elever: ElevRecord[] = [];
  const protocols: SavedProtocolRow[] = [];
  const history: AppState[] = [];

  CANDIDATES.forEach((c, i) => {
    const personalNumber = pnr(c.born, 200 + i * 7);
    const [first, last] = c.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ');
    const email = `${first}.${last}@exempel.se`;

    const tests = [...(c.previous || []), ...(c.today ? [c.today] : [])];
    tests.forEach((t, idx) => {
      const state = buildTest(c, email, personalNumber, t, idx);
      history.push(state);
      // Protokollet skapas ungefär 45 minuter efter provets starttid
      const created = new Date(new Date(`${state.properties.testDate}T${c.time}:00`).getTime() + 45 * 60_000);
      protocols.push({
        id: `demo-PROV-${i}-${idx}`,
        created_at: created.toISOString(),
        student_name: c.name,
        personal_number: personalNumber,
        license_type: c.license,
        test_type: state.properties.testType,
        transmission: state.properties.transmission,
        tachograph: 'Med färdskrivare',
        driving_result: state.result.drivingResult,
        safety_result: state.result.safetyCheckResult,
        examiner: state.properties.examiner,
        full_state: state,
      });
    });

    elever.push({
      id: `demo-elev-${i}`,
      source: 'trv',
      name: c.name,
      personalNumber,
      email,
      licenseType: c.license,
      transmission: c.transmission || 'Manuell',
      testType: c.testType,
      bookingTime: c.time,
      status: c.today ? 'Genomförd' : 'Inbokad',
      createdDate: today,
      place: 'Förarprov',
      city: 'Sundsvall',
      vehicle: ['TAXI', 'C', 'CE', 'C1', 'C1E', 'D', 'DE', 'D1', 'D1E'].includes(c.license) || i % 3 === 0 ? 'Trafikskolebil' : 'Egen bil',
      hasConditions: i % 5 === 2,
    });
  });

  history.sort((a, b) => a.properties.testDate.localeCompare(b.properties.testDate));
  protocols.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { elever, protocols, history };
}
