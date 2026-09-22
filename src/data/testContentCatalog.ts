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

// Officiella moment för motorcykelprov (A, A1, A2) enligt gällande provprotokoll
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
  'Signalkunskap och optiska signaler (huvud/försignal)',
  'Växlingsrörelse och radiostyrning',
  'Körning mot stoppsignal / restriktiv signalbild',
  'Halt räl / slir- och glidskyddshantering',
  'Nödstopp och snabbromsning från linjehastighet',
  'Hantering av strömavtagare och sektionspassager',
  'Dvärgsignaler och medgivande för växling',
  'Säkerhetsavsyning av koppel och bromsslangar'
];

TEST_CONTENT['Lokförare'] = [
  ...TRAIN_SPECIFIC_ITEMS,
  'Säkerhetskontroll (yttre och inre lok)',
  'Klargöring av fordon',
  'Bromsprov och täthetsprov',
  'Kontroll av tågbildning och rullande materiel',
  'Hantering av ATC-panel och felkoder',
  'Skyddsåtgärder vid påkörd vilt eller hinder på spår'
];

TEST_CONTENT['Lokförare (Person)'] = [
  ...TRAIN_SPECIFIC_ITEMS,
  'Passagerarhantering i nödsituationer',
  'Säkerhetskontroll (yttre och inre lok)',
  'Klargöring av fordon',
  'Bromsprov och täthetsprov',
  'Dörrblockering och plattformsövervakning',
  'Brandskydd och utrymning av persontåg',
  'Trafikantinformation vid trafikstörning',
  'Hissning av rullstolslyft och tillgänglighet'
];

TEST_CONTENT['Lokförare (Gods)'] = [
  ...TRAIN_SPECIFIC_ITEMS,
  'Farligt gods hantering (RID)',
  'Säkerhetskontroll (yttre och inre lok)',
  'Klargöring av fordon',
  'Bromsprov och täthetsprov',
  'Kontroll av vagnvikter och axeltryck',
  'Säkring av godsvagnar mot rullning (handbroms/skruvbroms)',
  'Rangering på bangård med radiostyrningsdosa',
  'Tillsyn av godsöverhäng och profilfrihet'
];

TEST_CONTENT['Spårvagn'] = [
  'Säkerhetskontroll spårvagn (yttre & förarhytt)',
  'Körning i blandtrafik mot bilister och cyklister',
  'Växelomläggning (manuell/radio/detektor)',
  'Dörrhantering och resenärssäkerhet vid påstigning',
  'Perrongstopp och exakt hållplatspositionering',
  'Signalkunskap för spårvagn (S-signaler och vita streck)',
  'Trafikering med optisk signalering',
  'Vagnteknik och enklare felavhjälpning på linjen',
  'Spårhalka och sandspridningssystem',
  'Nödbromsning och magnetskenbroms',
  'Backning och rangering i vagnhall',
  'Särskild uppmärksamhet vid gågator och torg',
  'Samverkan med trafikledningen vid banarbete'
];

TEST_CONTENT['Tunnelbana'] = [
  'Säkerhetskontroll tunnelbanevagn och förarhytt',
  'Stationsuppehåll och dörrhantering med speglar/kameror',
  'Körning i ATC/ATO (automatiskt tågskydd)',
  'Manuell körning vid signalfel (20-restriktion)',
  'Signalkunskap för tunnelbana och hyttsignalering',
  'Evakuering och vandring i tunnelmiljö',
  'Kommunikation med TLC (Trafikledningscentral)',
  'Klargöring av tunnelvagn i depå',
  'Hantering av spänningslös tredje skena (strömskena)',
  'Trafikering i extrem trängsel / rusningstid',
  'Säkerhetsåtgärder vid obehörig i spårområdet',
  'Brandlarm och rökutvecklingsprocedurer'
];

// B1 Körprov (Fyrhjuling / Lätt bil - Quadricycle upp till 450 kg / 550 kg för gods & max 15 kW)
export const B1_SPECIFIC_ITEMS = [
  'Säkerhetskontroll (fyrhjuling/microcar)',
  'Stabilitetskontroll och kurvtagning med kort hjulbas',
  'Backning och vändning på trång yta',
  'Start i lutning / handhavande av transmission',
  'Effektiv bromsning (panikbroms utan ABS vid behov)',
  'Parkering och säkring mot rullning',
  'Körning i blandtrafik och placering mot tyngre fordon',
  'Hastighetsanpassning och sidovindskänslighet',
  'Döda vinkeln och spegeluppsikt (begränsat synfält)',
  'Cirkulationsplats och körfältsbyte med lätt fordon',
  'Omkörning av långsamtgående fordon',
  'Körning i bostadsområde och farthinder'
];

TEST_CONTENT['B1'] = Array.from(new Set([
  ...baseContent,
  ...B1_SPECIFIC_ITEMS
]));

// Ytterligare Behörigheter & Förarbevis i Trafikverkets och Transportstyrelsens katalog
const traktorItems = [
  'Säkerhetskontroll traktor och draganordning',
  'Start i motlut/medlut med tungt ekipage',
  'Backning med jordbruksvagn/flakvagn mot lastramp',
  'Körning på allmän väg och vägrensplacering',
  'LGF-skylt och belysningskontroll',
  'Möte och väjningsplikt på smal landsväg',
  'Hydraulik och kraftuttag (PTO-säkerhet)',
  'Stopp och parkering med lastsäkring',
  'Diffspärr och fyrhjulsdrift i svår terräng',
  'Tillsyn av trepunktslyft och redskapsinfästning',
  'Gatukorsning och siktprioritet',
  'Sväng från landsväg (vänstersväng med släp)',
  'Cirkulationsplats och placering',
  'Oskyddade trafikanter och döda vinklar runt traktorn',
  'Användande av bromsar och styrbroms'
];

TEST_CONTENT['Traktor'] = traktorItems;
TEST_CONTENT['Traktor (Traktorkort)'] = traktorItems;
TEST_CONTENT['Traktorkort'] = traktorItems;

TEST_CONTENT['Snöskoter (Förarbevis)'] = [
  'Säkerhetskontroll snöskoter och nödstoppslina',
  'Start och körställning i varierad terräng',
  'Körning i djup snö och skråkörning i backe',
  'Passage av preparerad skoterled, allmän väg och järnväg',
  'Isbedömning och issäkerhetsutrustning (isdubbar)',
  'Naturvårdshänsyn, skogsplantering och rennäringsområden',
  'Bogsering av kälke/släde och passagerarsäkerhet',
  'Vändning i brant terräng och fastkörningshantering',
  'Fjällsäkerhet, lavinkunskap och nödbivack/utrustning',
  'Nattkörning, siktförhållanden och hjälm/visirvård',
  'Första hjälpen och larmrutiner i obygd'
];

TEST_CONTENT['Terränghjuling (ATV)'] = [
  'Säkerhetskontroll ATV och skyddsutrustning',
  'Aktiv viktförskjutning och kurvteknik',
  'Körning över stenar, stockar och ojämn mark',
  'Vinschning, förankring och bärgningsteknik',
  'Körning i brant backe (uppför och utför)',
  'Vältförebyggande åtgärder och säker avstigning',
  'Däcktryck och spårval i mjuk mark/myr',
  'Säkring av last på lasträcken (tyngdpunkt)',
  'Backning i terräng med begränsad sikt',
  'Lagstiftning: Körning i terräng vs transport på allmän väg',
  'Miljöhänsyn och markskador'
];

TEST_CONTENT['Truck (A+B)'] = [
  'Daglig tillsyn, hydraulik och batteri/gashantering',
  'Stabilitetstriangel och tyngdpunktsberäkning',
  'Stapling i pallställ på hög höjd (nivå 3-5)',
  'Körning med skymd sikt (backning med signalering)',
  'Hantering av varierande palltyper, containers och långgods',
  'Fotgängarsäkerhet och signalering vid korsande truckgångar',
  'Körning på lutande ramp och lastkaj',
  'Lastning och lossning av lastbilstrailer',
  'Nödstopp, bromsprov och parkeringsbroms',
  'Hantering av skadat gods och utrymningsvägar i lager',
  'Ergonomi och säker förarställning'
];

TEST_CONTENT['Grävmaskin / Hjullastare'] = [
  'Daglig tillsyn, hydrauliktryck och snabbfäste',
  'Schaktning och släntning med precision och laser/maskinstyrning',
  'Planering av mark och lastning på dumper/lastbil',
  'Stabilitet vid tunga lyft och arbete nära schaktkanter',
  'Säkerhet kring ledningar i mark (kabelanvisning) och luftledningar',
  'Säkerhet på arbetsplats, signalman och 360-kamera/döda vinklar',
  'Byte av skopor och hydrauliska redskap',
  'Körning i brant lutning och bandspårning/hjuldrift',
  'Säkring av maskin vid transport på maskintrailer',
  'Nödsänkning av bom/aggregat vid motorbortfall'
];

