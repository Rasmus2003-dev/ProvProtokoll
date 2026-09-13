export const TEST_CONTENT: Record<string, string[]> = {
  B: [
    // Kolumn 1
    'Säkerhetskontroll',
    'Start från vägkant',
    'Start i lutning',
    'Backning',
    'Körställning',
    'Effektiv bromsning',
    'Parkering',
    'Vändning med manövrering',
    'Motorväg/motortrafikled',
    'Körning mot mål',

    // Kolumn 2
    'Signalreglerad korsning',
    'Vändning',
    'Järnväg/Spårvägskorsning',
    'Nedsatt sikt eller mörker',
    'Körfältsbyte',
    'Stillastående fordon/hinder',
    'Användande av reglage',
    'Oskyddade trafikanter',
    'Infart på landsväg',
    'Gatukorsning',

    // Kolumn 3
    'Vägarbetsområde',
    'Omkörning',
    'Riskfyllt väglag',
    'Smal/krokig väg',
    'Sväng från landsväg',
    'Landsväg',
    'Cirkulationsplats',
    'Körfält',
    'Möte'
  ],
};

export const BUS_SPECIFIC_ITEMS = [
  'Infart/utfart från busshållplats',
  'I och urstigning',
  'Info till passagerare',
  'Passagerarvänlig körning'
];

export const HEAVY_TRAILER_ITEMS = [
  'Sammankoppling och isärkoppling'
];

export const HEAVY_TRUCK_ITEMS = [
  'Stanna för lastning och lossning (lastramp/brygga)',
  'Backning med samtidig svängning'
];

export const BE_SAFETY_ITEMS = [
  'Dörrar',
  'Sammankoppling',
  'Blinkers',
  'Systematisk kontroll',
  'Vindrutetorkare och spolare',
  'Last',
  'Bromsar på släpfordon',
  'Belysning',
  'Däck och fälg',
  'Reflexer',
  'Bromsar på dragfordon',
  'Vätskor',
  'Rutor',
  'Backspeglar',
  'Styrning',
  'Varningssystem',
  'Signalhorn',
  'Katastrofbromswire',
  'Kopplingsanordning'
];

export const ALL_SAFETY_ITEMS = [
  'Säkerhetskontroll',
  'Stänkskydd',
  'Säkerhetsutrustning',
  'Vätskor',
  'Färdskrivare',
  'Katastrofbromswire',
  'Rutor',
  'Belysning, blinkers och signal',
  'Belysning',
  'Blinkers',
  'Signalhorn',
  'Bromsar på släpfordon',
  'Bromsar på dragfordon',
  'Dörrar',
  'Däck och fälg',
  'Reflexer',
  'Styrning',
  'Sammankoppling',
  'Kopplingsanordning',
  'Backspeglar',
  'Systematisk kontroll',
  'Sammankoppling och isärkoppling',
  'Varningssystem',
  'Registreringsbevis',
  'Fordonskontroll',
  'Vindrutetorkare och spolare',
  'Last',
  'Säkerhetskontroll motorcykel',
  'Styrsystem',
  'Säkerhetskontroll (yttre och inre lok)',
  'Bromsar',
  'Broms- och elanslutningar till släpfordon',
  'Klargöring av fordon',
  'Däck, fälg och hjulbultar',
  'Dörrautomatik/nödöppning',
  'Bromsprov och täthetsprov'
];

const HEAVY_BASE_SAFETY = [
  'Vätskor',
  'Rutor',
  'Backspeglar',
  'Varningssystem',
  'Vindrutetorkare och spolare',
  'Styrsystem',
  'Bromsar',
  'Däck, fälg och hjulbultar',
  'Stänkskydd',
  'Färdskrivare',
  'Belysning, blinkers och signal',
  'Systematisk kontroll',
  'Registreringsbevis',
  'Last'
];

const TRAILER_SAFETY = [
  'Kopplingsanordning',
  'Broms- och elanslutningar till släpfordon',
  'Katastrofbromswire',
  'Bromsar på släpfordon'
];

const BUS_SAFETY = [
  'Säkerhetsutrustning'
];

// Apply B's content to all other categories, appending heavy safety items for heavy licenses and BE/B96
const baseContent = TEST_CONTENT.B.filter(item => item !== 'Säkerhetskontroll');

const heavyTypes = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
const mcTypes = ['A', 'A1', 'A2', 'AM'];

heavyTypes.forEach(type => {
  const isTrailer = type.endsWith('E');
  const isBus = type.startsWith('D');
  const isTruck = type.startsWith('C');
  
  let items = [...baseContent, ...HEAVY_BASE_SAFETY];
  
  if (isBus) {
    items = [...items, ...BUS_SPECIFIC_ITEMS, ...BUS_SAFETY];
  }
  
  if (isTruck) {
    items = [...items, ...HEAVY_TRUCK_ITEMS];
  }
  
  if (isTrailer) {
    items = [...items, ...HEAVY_TRAILER_ITEMS, ...TRAILER_SAFETY];
  }

  TEST_CONTENT[type] = Array.from(new Set(items));
});

// Specifika provmoment för BE och B96
TEST_CONTENT['BE'] = Array.from(new Set([...baseContent, ...BE_SAFETY_ITEMS]));
TEST_CONTENT['B96'] = Array.from(new Set([...baseContent, ...BE_SAFETY_ITEMS]));

// Officiella moment för motorcykelprov (A, A1, A2) enligt Trafikverkets protokoll
export const MC_SPECIFIC_ITEMS = [
  'Säkerhetskontroll',
  'Lågfart',
  'Högfart',
  'Bromsning',
  'Manövrering och uppställning',
  'Lågfartsbana',
  'Högfartsbana',
  'Bromsprov (50/70/90 km/h)',
  'Säkerhetskontroll motorcykel'
];

mcTypes.forEach(type => {
  TEST_CONTENT[type] = Array.from(new Set([
    'Säkerhetskontroll',
    'Lågfart',
    'Högfart',
    'Bromsning',
    'Körställning',
    'Start från vägkant',
    'Start i lutning',
    'Körfältsbyte',
    'Körfält',
    'Gatukorsning',
    'Signalreglerad korsning',
    'Cirkulationsplats',
    'Smal/krokig väg',
    'Sväng från landsväg',
    'Landsväg',
    'Infart på landsväg',
    'Motorväg/motortrafikled',
    'Stillastående fordon/hinder',
    'Körning mot mål',
    'Oskyddade trafikanter',
    'Möte',
    'Omkörning',
    'Vägarbetsområde',
    'Riskfyllt väglag',
    'Nedsatt sikt eller mörker',
    'Järnväg/Spårvägskorsning',
    'Användande av reglage',
    'Manövrering och uppställning'
  ]));
});

export const TAXI_SPECIFIC_ITEMS = [
  'Hantera GPS/Karta',
    'Manövrering i trånga utrymmen',
  'Passagerarvänlig bromsning',
  'Passagerares säkerhet',
  'Stannande',
];

TEST_CONTENT['TAXI'] = Array.from(
  new Set([...baseContent, ...TAXI_SPECIFIC_ITEMS, 'Fordonskontroll'])
);

export const TRAIN_SPECIFIC_ITEMS = [
  'Tågklarerarsamtal och radiokommunikation',
  'Uppkoppling och ATC/ERTMS övervakning',
  'Hastighetsanpassning för tågets vikt och bromsprocent',
  'Perrongstopp och resenärsutrop',
  'Hantering av nedsatt sikt/halka på räl',
  'Signalkunskap och ljussignaler',
  'Växlingsrörelse och radiostyrning'
];

TEST_CONTENT['Lokförare'] = [...TRAIN_SPECIFIC_ITEMS, 'Säkerhetskontroll (yttre och inre lok)', 'Klargöring av fordon', 'Bromsprov och täthetsprov'];
TEST_CONTENT['Lokförare (Person)'] = [...TRAIN_SPECIFIC_ITEMS, 'Passagerarhantering i nödsituationer', 'Säkerhetskontroll (yttre och inre lok)', 'Klargöring av fordon', 'Bromsprov och täthetsprov'];
TEST_CONTENT['Lokförare (Gods)'] = [...TRAIN_SPECIFIC_ITEMS, 'Farligt gods hantering (RID)', 'Säkerhetskontroll (yttre och inre lok)', 'Klargöring av fordon', 'Bromsprov och täthetsprov'];
TEST_CONTENT['Spårvagn'] = ['Körning i blandtrafik', 'Växelomläggning (manuell/radio)', 'Dörrhantering', 'Perrongstopp', 'Signalkunskap för spårvagn', 'Trafikering med optisk signalering', 'Vagnteknik och felavhjälpning'];
TEST_CONTENT['Tunnelbana'] = ['Stationsuppehåll och dörrhantering', 'Körning i ATC/ATO', 'Signalkunskap för tunnelbana', 'Evakuering i tunnel', 'Kommunikation med TLC (Trafikledningscentral)', 'Klargöring av tunnelvagn'];

// Ytterligare Behörigheter & Förarbevis i Trafikverkets och Transportstyrelsens katalog
TEST_CONTENT['Traktor (Traktorkort)'] = [
  'Säkerhetskontroll traktor och draganordning',
  'Start i motlut/medlut',
  'Backning med jordbruksvagn/släp',
  'Körning på allmän väg och vägren',
  'LGF-skylt och belysningskontroll',
  'Möte och väjningsplikt på smal väg',
  'Hydraulik och kraftuttag (PTO-säkerhet)',
  'Stopp och parkering med lastsäkring'
];

TEST_CONTENT['Snöskoter (Förarbevis)'] = [
  'Säkerhetskontroll snöskoter och nödstoppslina',
  'Start och körställning i varierad terräng',
  'Körning i djup snö och skråkörning',
  'Passage av skoterled, allmän väg och järnväg',
  'Isbedömning och issäkerhetsutrustning (isdubbar)',
  'Naturvårdshänsyn, skogsplantering och rennäringsområden',
  'Bogsering och nödsituation i fjällmiljö'
];

TEST_CONTENT['Terränghjuling (ATV)'] = [
  'Säkerhetskontroll ATV och skyddsutrustning',
  'Viktförskjutning och kurvteknik',
  'Körning över hinder och ojämn mark',
  'Vinschning och bärgningsteknik',
  'Körning i backe och vältförebyggande åtgärder',
  'Regler för körning i terräng vs allmän väg'
];

TEST_CONTENT['Truck (A+B)'] = [
  'Daglig tillsyn och batteri/gashantering',
  'Stabilitetstriangel och tyngdpunktsberäkning',
  'Stapling i pallställ på hög höjd',
  'Körning med skymd sikt (backning)',
  'Hantering av varierande palltyper och laster',
  'Fotgängarsäkerhet och signalering i lager'
];

TEST_CONTENT['Grävmaskin / Hjullastare'] = [
  'Daglig tillsyn, hydraulik och snabbfäste',
  'Schaktning och släntning med precision',
  'Planering och lastning på dumper/lastbil',
  'Stabilitet vid lyft och arbete nära ledningar',
  'Säkerhet på arbetsplats och signalman'
];

