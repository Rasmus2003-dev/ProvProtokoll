/**
 * Trafikverkets fordonstekniska krav och provföreskrifter (TSFS 2012:43 med ändringar)
 * Samt teknisk inspektörsguide för tryckluft, bromskretsar, färdskrivare och koppling.
 */

export interface HeavyVehicleRequirement {
  code: string;
  name: string;
  minTotalWeight: string;
  actualMinWeight: string;
  dimensions: {
    minLength: string;
    minWidth?: string;
    cargoHeight?: string;
  };
  cargoLoadRequirement: string;
  transmissionRequirement: string;
  mandatoryEquipment: string[];
  keyRules: string[];
}

export const HEAVY_VEHICLE_REQUIREMENTS: Record<string, HeavyVehicleRequirement> = {
  C1: {
    code: 'C1',
    name: 'Medeltung lastbil',
    minTotalWeight: 'Totalvikt minst 4 000 kg (max 7 500 kg)',
    actualMinWeight: 'Faktisk bruttovikt under provet: Minst 4 000 kg',
    dimensions: {
      minLength: 'Minst 5,0 meter',
      cargoHeight: 'Lastutrymmet ska vara minst lika brett och högt som förarhytten'
    },
    cargoLoadRequirement: 'Måste vara lastad så att faktisk bruttovikt uppgår till minst 4 000 kg',
    transmissionRequirement: 'Manuell eller automatisk (villkor 78 registreras vid prov med automatväxlat fordon om inte hävningsregel uppfylls)',
    mandatoryEquipment: [
      'Låsningsfria bromsar (ABS)',
      'Digital färdskrivare (om fordonet omfattas av kör- och vilotider)',
      'Backspeglar för förare och inspektör (vidvinkel- och närzonsspegel)',
      'Stoppkloss (underläggskil)',
      'Brandsläckare och varningstriangel'
    ],
    keyRules: [
      'Provfordonet får inte vara registrerat som personbil klass II.',
      'Sikten bakåt ska ske via backspeglar (lastutrymmet ska skymma sikten genom innerbackspegel).'
    ]
  },
  C: {
    code: 'C',
    name: 'Tung lastbil',
    minTotalWeight: 'Totalvikt minst 12 000 kg',
    actualMinWeight: 'Faktisk bruttovikt under provet: Minst 10 000 kg',
    dimensions: {
      minLength: 'Minst 8,0 meter',
      minWidth: 'Minst 2,40 meter',
      cargoHeight: 'Lastutrymmet ska vara slutet/täckt och minst lika brett och högt som hytten'
    },
    cargoLoadRequirement: 'Lastad så att bruttovikten är minst 10 000 kg. Lasten ska vara jämnt fördelad och säkrad enligt TSFS.',
    transmissionRequirement: 'Växellådan ska ha minst 8 framåtriktade växlar (inkl. split/range om manuell).',
    mandatoryEquipment: [
      'Fulltrycksluftbromssystem med tryckmätare i förarplats',
      'Låsningsfria bromsar (ABS)',
      'Tillsatsbroms/hjälpbroms (retarder eller avgasbroms)',
      'Digital / intelligent färdskrivare (Smart Tacho 1 eller 2)',
      'Vidvinkel-, närzons- och frontspegel/kamerasystem',
      'Minst 1 st stoppkloss i hållare',
      'Lastsäkringsutrustning i gott skick'
    ],
    keyRules: [
      'Kandidaten ska kunna redogöra för axeltryck och totalviktsbegränsningar enligt BK1, BK2, BK3 och BK4.',
      'Kandidaten ska kunna utföra provtryckning, täthetskontroll och kontrollera spärrventilens funktion.'
    ]
  },
  C1E: {
    code: 'C1E',
    name: 'Medeltung lastbil med släp',
    minTotalWeight: 'Dragfordon C1 + släp med totalvikt > 750 kg (kombination max 12 000 kg)',
    actualMinWeight: 'Släpets faktiska vikt minst 800 kg',
    dimensions: {
      minLength: 'Ekipagets sammanlagda längd minst 8,0 meter',
      cargoHeight: 'Släpets kaross ska vara minst lika bred och hög som dragfordonet'
    },
    cargoLoadRequirement: 'Släpet ska vara lastat till minst 800 kg faktisk bruttovikt.',
    transmissionRequirement: 'Manuell eller automat enligt C1-krav',
    mandatoryEquipment: [
      'Katastrofbroms eller påskjutsbroms/tryckluftsbroms med fungerande spärrfunktion',
      'ABS-bromssystem',
      'Kopplingsanordning (kula 50 mm eller bygel)',
      'Backspeglar anpassade för släpets bredd'
    ],
    keyRules: [
      'Sammankoppling och isärkoppling MÅSTE prövas under provet.',
      'Säkerhetsdragprov och kontroll av mekanisk spärrning ska utföras före körning.'
    ]
  },
  CE: {
    code: 'CE',
    name: 'Tung lastbil med tungt släp',
    minTotalWeight: 'Kombinationens totalvikt minst 20 000 kg',
    actualMinWeight: 'Faktisk bruttovikt under provet: Minst 15 000 kg',
    dimensions: {
      minLength: 'Ledad kombination (dragbil + semitrailer): minst 14,0 m. Dragbil + släpvagn: minst 16,0 m.',
      minWidth: 'Minst 2,40 meter',
      cargoHeight: 'Släpets karosseri ska vara minst lika brett och högt som dragfordonet'
    },
    cargoLoadRequirement: 'Ekipaget ska vara lastat så att bruttovikten är minst 15 000 kg.',
    transmissionRequirement: 'Minst 8 växlar framåt',
    mandatoryEquipment: [
      'Tvåleds tryckluftssystem (matarledning röd, manöverledning gul) eller Duomatic',
      'ABS/EBS-kabel (ISO 7638)',
      'VBG-bygelkoppling eller vändskiva med låsindikering',
      'Stoppklossar för både dragbil och släp',
      'Digital färdskrivare',
      'Underkörningsskydd bak och på sidorna'
    ],
    keyRules: [
      'Obligatorisk isär- och sammankoppling i korrekt ordning (mekanik, luft, el, stödben/dragstång).',
      'Minst ett precisionsmanöverprov med svängning och backning mot lastkaj/brygga.'
    ]
  },
  D1: {
    code: 'D1',
    name: 'Mellanstor buss (max 16 passagerare)',
    minTotalWeight: 'Totalvikt minst 4 000 kg (längd max 8,0 meter)',
    actualMinWeight: 'Faktisk bruttovikt minst 4 000 kg',
    dimensions: {
      minLength: 'Minst 5,0 meter (max 8,0 meter)'
    },
    cargoLoadRequirement: 'Ingen barlast krävs om passagerarsäten är monterade',
    transmissionRequirement: 'Manuell eller automat',
    mandatoryEquipment: [
      'Låsningsfria bromsar (ABS)',
      'Nödutgångar markerade och utrustade med nödhammare',
      'Första hjälpen-utrustning & brandsläckare',
      'Färdskrivare om fordonet nyttjas i yrkesmässig trafik'
    ],
    keyRules: [
      'Prov i passagerarsäkerhet, dörrlåsning och utrymningsvägar ingår obligatoriskt.'
    ]
  },
  D: {
    code: 'D',
    name: 'Buss (Tung buss)',
    minTotalWeight: 'Registrerad som buss (fler än 8 passagerare utöver förare)',
    actualMinWeight: 'Normal tomvikt / provklar buss',
    dimensions: {
      minLength: 'Minst 10,0 meter',
      minWidth: 'Minst 2,40 meter'
    },
    cargoLoadRequirement: 'Kräver ej fysisk last, full inredning',
    transmissionRequirement: 'Manuell eller automatisk växellåda',
    mandatoryEquipment: [
      'Fulltrycksluftbroms med två oberoende kretsar',
      'Låsningsfria bromsar (ABS)',
      'Hjälpbroms/retarder',
      'Digital färdskrivare',
      'Nödhammare, nödöppnare för dörrar och takluckor',
      'Brandsläckare (minst 6 kg pulver) och förbandslåda',
      'Alkolås (enligt svensk skolskjuts-/kollektivtrafikstandard)'
    ],
    keyRules: [
      'Särskilt fokus på mjuk passagerarkörning, retarderhantering och dörrautomatik vid hållplatser.',
      'Överhäng fram och bak i kurvor och vid hållplatsangöring.'
    ]
  },
  DE: {
    code: 'DE',
    name: 'Buss med tungt släp / Ledbuss',
    minTotalWeight: 'Buss behörighet D + släp med totalvikt minst 1 250 kg',
    actualMinWeight: 'Släpets faktiska vikt minst 800 kg',
    dimensions: {
      minLength: 'Släpets lastutrymme minst 2,0 m brett och 2,0 m högt'
    },
    cargoLoadRequirement: 'Släpet lastat till minst 800 kg bruttovikt.',
    transmissionRequirement: 'Enligt buss D',
    mandatoryEquipment: [
      'Kopplingssystem för släp, backkamera/extra speglar, ABS-koppling'
    ],
    keyRules: [
      'Sammankoppling, isärkoppling och backning med släp/ledfordon.'
    ]
  }
};

/**
 * Teknisk guide för tryckluftsbromsar & provtryckning
 */
export interface AirBrakeGuideStep {
  step: number;
  title: string;
  expectedValue: string;
  action: string;
  failureRisk: string;
}

export const AIR_BRAKE_STEPS: AirBrakeGuideStep[] = [
  {
    step: 1,
    title: 'Arbetstryck & Avlastningsventil (Lufttork)',
    expectedValue: '8,0 – 12,5 bar (Beroende på fordon)',
    action: 'Låt motorn gå tills kompressorn når fullt arbetstryck. Lyssna efter "nysningen" när lufttorkens avlastningsventil blåser ut kondensvatten och olja.',
    failureRisk: 'Utebliven nysning innebär igensatt tork eller defekt avlastningsventil, vilket leder till isproppar i ventiler under vinterhalvåret.'
  },
  {
    step: 2,
    title: 'Täthetsprov (Färdbroms ansatt)',
    expectedValue: 'Max 0,5 bar tryckfall på 3 minuter',
    action: 'Stäng av motorn. Trampa ner färdbromsen hårt och håll kvar. Läs av manometern i 3 minuter (eller 1 minut vid snabbkontroll med max 0,2 bar fall). Lyssna efter väsande läckage.',
    failureRisk: 'Körförbud om tryckfallet överstiger gränsvärdet! Kan hävas tillfälligt för verkstadskörning om kompressorn klarar att bibehålla arbetstryck på tomgång.'
  },
  {
    step: 3,
    title: 'Lågtrycksindikering (Summer & Varningslampa)',
    expectedValue: 'Aktiveras vid 4,5 – 5,5 bar',
    action: 'Med avstängd motor, pumpbromsa upprepade gånger tills trycket sjunker. Kontrollera att summer ljuder och röd varningslampa tänds i instrumentet.',
    failureRisk: 'Föraren saknar varning innan bromstrycket blir kritiskt lågt, vilket kan resultera i oväntad spärrnypning på motorväg.'
  },
  {
    step: 4,
    title: 'Spärrventil (Katastroffunktion)',
    expectedValue: 'Slår till vid 2,0 – 3,0 bar',
    action: 'Fortsätt pumpbromsa tills spärrventilen (parkeringsbromsens manöverdon) automatiskt fjädrar ut och lägger an fjäderbromscylindrarna.',
    failureRisk: 'Om ventilen ej löser ut kan fordonet rulla helt utan bromsverkan när luften är tömd.'
  },
  {
    step: 5,
    title: 'Kompressorns uppladdningsförmåga',
    expectedValue: 'Bygger upp från summergräns till fullt arbetstryck inom ca 3 minuter på förhöjd tomgång',
    action: 'Starta motorn och observera nålarnas stigning. Notera att båda kretsarna (krets 1 bak, krets 2 fram) laddas jämnt.',
    failureRisk: 'Sliten kompressor orkar inte återhämta luft vid upprepade bromsningar i nedförsbackar eller stadstrafik.'
  }
];

/**
 * Sammankoppling och isärkoppling (CE / C1E / BE)
 */
export const COUPLING_CHECKLIST = {
  disconnectOrder: [
    { nr: 1, text: 'Säkra släpet: Ansätt släpvagnens parkeringsbroms och lägg under stoppklossar bakom hjulen.' },
    { nr: 2, text: 'Fäll ner stödbenet/stödhjulet tills det vilar stadigt mot marken.' },
    { nr: 3, text: 'Lossa el- och signalkablar (belysning, ABS/EBS ISO 7638) och häng upp i hållarna.' },
    { nr: 4, text: 'Lossa tryckluftsslangarna: KOPPLA LOSS RÖD (matning) FÖRST så att släpvagnens nödbroms slår till, därefter GUL (manöver).' },
    { nr: 5, text: 'Öppna kopplingsmekanismen (spärrhandtag på VBG eller spärr på vändskiva).' },
    { nr: 6, text: 'Kör försiktigt fram dragfordonet ca 30–50 cm och kontrollera att ekipaget frikopplats rent.' }
  ],
  connectOrder: [
    { nr: 1, text: 'Backa mot dragstången/tappen: Stanna precis framför och kontrollera höjden så dragöglan möter draget i centrum.' },
    { nr: 2, text: 'Backa sista biten så kopplingen klickar i lås.' },
    { nr: 3, text: 'DRAGPROV: Lägg i låg växel och gör ett mjukt dragprov framåt för att verifiera mekanisk låsning.' },
    { nr: 4, text: 'Visuell kontroll: Kontrollera att indikeringsdubb är i plan (VBG) eller att låsspärren fallit i spår och säkra med sprint.' },
    { nr: 5, text: 'Anslut tryckluft: KOPPLA GUL FÖRST, DÄREFTER RÖD (matning). Släpet frigörs då från katastrofbromsen.' },
    { nr: 6, text: 'Anslut el- och ABS/EBS-kablar. Kontrollera att instrumentet inte visar ABS-varningslampa för släp.' },
    { nr: 7, text: 'Veva upp stödben/stödhjul och lås det i transportläge.' },
    { nr: 8, text: 'Lossa släpets parkeringsbroms, ta bort stoppklossar och genomför funktionskontroll av belysning.' }
  ]
};
