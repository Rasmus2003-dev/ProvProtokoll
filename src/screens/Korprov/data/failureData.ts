export const TAXI_ONLY_AREAS = [
  "Passagerarvänlig körning",
  "Handlings- och omdömesförmåga"
];

export const failureCategories = {
  areas: [
    "Trafiksäkerhet och beteende",
    "Manövrering",
    "Trafikregler",
    "Fordonskännedom",
    "Miljömedveten körning",
    "Passagerarvänlig körning",
    "Handlings- och omdömesförmåga"
  ],
  deficiencies: {
    "Trafiksäkerhet och beteende": [
      "Förutse och bedöma konsekvenser av olika händelseförlopp",
      "Köra med tillräckliga säkerhetsmarginaler",
      "Anpassa hastigheten efter de omständigheter som råder",
      "Anpassa placeringen efter de omständigheter som råder",
      "Samspela med andra trafikanter",
      "Visa god uppmärksamhet",
      "Identifiera risker i olika trafiksituationer och trafikmiljöer",
      "Anpassa körningen efter väglag och siktförhållanden",
      "Avsökning och blickriktning i korsningar och cirkulationsplatser",
      "Uppmärksamhet på cyklister och oskyddade trafikanter vid sväng",
      "Framförhållning för oskyddade trafikanter (barn, fotgängare, cyklister)",
      "Bedömning av mötande trafiks avstånd och hastighet",
      "Uppmärksamhet bakåt vid inbromsning och fältbyte (döda vinkeln & speglar)",
      "Teckengivning och tydlighet i avsikter",
      "Handlingsberedskap i närheten av skolor och bostadsområden",
      "Defensiv körning i miljöer med nedsatt sikt eller dimma",
      "Riskmedvetenhet vid passage av skymda utfarter och korsningar"
    ],
    "Manövrering": [
      "Uppvisa en rutinmässig manövrering",
      "Manövrera fordonet mjukt och under kontroll",
      "Identifiera risker förknippade med fordonets funktion och manövrering",
      "Anpassa till utrymme och hinder",
      "Genomföra säkra riktningsförändringar",
      "Styra fordonet med god precision och placering i snäva svängar",
      "Kopplingsteknik och val av växel vid acceleration och fartminskning",
      "Bromsteknik och effektiv bromsning utan onödigt dröjsmål",
      "Krypkörning och finmanövrering vid parkering och backning",
      "Start i brant lutning utan bakåtrullning eller motorstopp",
      "Koordinering av gas, koppling och handbroms i pressade situationer",
      "Hantering av däcksladd eller nedsatt friktion (halkkörningskontroll)",
      "Pedalhantering under paniksituationer eller nödstopp",
      "Smidigt handhavande av reglage under körning utan att tappa fokus på vägen"
    ],
    "Trafikregler": [
      "Tillämpa de regler som gäller för körning med fordon",
      "Iaktta väjningsplikt och stopplikt",
      "Följa regler vid körfältsbyte, sammanvävning och hinder",
      "Tillämpa gällande hastighetsbegränsningar och hastighetsskyltar",
      "Efterfölja vägmärken, trafiksignaler och körfältsmarkeringar",
      "Tillämpa regler för cirkulationsplatser och svängar på landsväg",
      "Respektera och lämna företräde enligt högerregeln i bostadsområden",
      "Korrekt tillämpning av stopplikt (stanna helt på stopplinjen)",
      "Övergångsställen och cykelpassager (gällande företrädesregler)",
      "Sammanvävning (blixtlåsprincipen) vid vägarbeten och påfarter",
      "Placering och körfältsval vid svängar i flervägskorsningar",
      "Otillåten blockering av korsning eller gult ljus (korsningsblockering)",
      "Avståndsregler och avstånd till framförvarande fordon (tresekundersregeln)"
    ],
    "Fordonskännedom": [
      "Utföra kontroller på fordonet",
      "Kontrollera fordonets skick och trafiksäkerhet",
      "Identifiera risker förknippade med fordonets funktion",
      "Identifiera och åtgärda felaktigheter vid säkerhetskontroll",
      "Identifiera risker förknippade med fordonets funktion och manövrering",
      "Använda fordonets reglage, belysning och hjälpsystem på rätt sätt",
      "Anpassa förarstolen och speglar till en ergonomisk och säker körställning",
      "Identifiera varningslampor på instrumentpanelen och förstå deras betydelse",
      "Kontroll av däckens mönsterdjup, skador och lufttryck",
      "Lokalisering och kontroll av säkerhetsbälten och krockkuddar",
      "Manövrering av defroster, vindrutetorkare, spolare och klimatanläggning under färd",
      "Säkerhetskontroll av broms- och styrservo",
      "Bedömning av lastens surrning och lastsäkerhet (för tunga fordonsklasser/släp)",
      "Korrekt till- och frånkoppling av släpvagn (bromsuttag, vändskiva/dragstång, katastrofbromswire)"
    ],
    "Miljömedveten körning": [
      "Köra fordonet med god planering och framförhållning",
      "Använda körteknik som medför låg bränsleförbrukning (EcoDrive)",
      "Utnyttja fordonets rörelseenergi (rulla/motorbromsa) på ett effektivt sätt",
      "Växla upp tidigt och undvika onödigt höga motorvarvtal",
      "Planera körningen för att undvika onödiga stopp och inbromsningar",
      "Undvika tomgångskörning eller onödiga accelerationer",
      "Stänga av strömförbrukare och klimatanläggning när de ej behövs",
      "Aerodynamisk medvetenhet (stängda rutor och takbox vid höga hastigheter)",
      "Smarta vägval för att undvika tätortstrafik och onödig köbildning"
    ],
    "Passagerarvänlig körning": [
      "Köra med god planering och framförhållning",
      "Anpassa placeringen efter passagerarkomfort",
      "Anpassa hastigheten efter passagerarkomfort",
      "Använda de regler som gäller vid körning med fordon",
      "Genomföra mjuka och behagliga accelerationer och inbromsningar",
      "Anpassa kurvhastighet så att passagerare inte utsätts för obehagliga sidokrafter",
      "Skapa förtroende och trygghetskänsla hos passagerare under hela färden",
      "Undvika abrupta filbyten eller häftiga girar",
      "Hänsyn till passagerare i buss/taxi vid på- och avstigning",
      "Mjuk anpassning till gupp, vägbucklor och ojämnheter",
      "Temperaturreglering och god ventilation i passagerarutrymmet"
    ],
    "Handlings- och omdömesförmåga": [
      "Se och förstå risker i olika trafiksituationer",
      "Samarbeta med andra trafikanter och förstå konsekvenser",
      "Köra med tillräckliga säkerhetsmarginaler",
      "Värdera komplexa trafiksituationer och agera lugnt i stressiga moment",
      "Anpassa beslutsfattande och uppträda med gott omdöme i tätortstrafik",
      "Analysera och förutse risker vid skymd sikt eller vägarbeten",
      "Identifiera och motverka uttröttning eller stress under körpasset",
      "Agera snabbt och korrekt vid plötsliga hinder på vägbanan",
      "Uppvisa god självvärdering efter att ett mindre förarmisstag gjorts",
      "Säkerhetsmedvetet bemötande av aggressiva medtrafikanter"
    ]
  }
};

// Formuleringar i Trafikverkets nya protokoll under "Du måste bli bättre på:".
// Följer Trafikverkets förarprovskatalog och kursplanemål (TSFS).
export const newLayoutDeficiencies: Record<string, string[]> = {
  "Trafiksäkerhet och beteende": [
    "Planera din körning efter det du ser",
    "Samspela med andra trafikanter",
    "Välja lämplig placering",
    "Anpassa hastigheten efter rådande förhållanden",
    "Hålla tillräckliga säkerhetsmarginaler",
    "Upptäcka och förutse risker i god tid",
    "Ha god uppsikt och avsöka omgivningen rörligt",
    "Kontrollera döda vinkeln och speglar vid körfältsbyte och sväng",
    "Visa hänsyn till oskyddade trafikanter",
    "Anpassa körningen efter väglag och sikt",
    "Avsöka och planera körningen i korsningar och cirkulationsplatser"
  ],
  "Manövrering": [
    "Manövrera fordonet mjukt och under kontroll",
    "Hantera reglagen och växlingen rutinmässigt",
    "Styra fordonet med god precision och linjeföring",
    "Anpassa manövreringen till utrymme och hinder",
    "Bromsa effektivt och mjukt med god framförhållning",
    "Backa och parkera med god uppsikt och orientering",
    "Starta i motlut och krypköra utan bakåtrullning",
    "Utföra säkra och kontrollerade riktningsförändringar"
  ],
  "Trafikregler": [
    "Iaktta väjningsplikt, högerregeln och stopplikt",
    "Följa gällande hastighetsbegränsningar",
    "Följa vägmärken, trafiksignaler och vägmarkeringar",
    "Följa reglerna vid körfältsbyte och sammanvävning",
    "Följa reglerna vid infart, körning i och utfart ur cirkulationsplats",
    "Lämna företräde vid övergångsställen och cykelpassager",
    "Hålla tillräckligt avstånd till framförvarande fordon"
  ],
  "Fordonskännedom": [
    "Utföra en fullständig säkerhetskontroll av fordonet",
    "Upptäcka fel och föreslå åtgärder",
    "Förklara varför kontrollen är viktig för trafiksäkerheten",
    "Använda fordonets belysning, reglage och stödsystem på rätt sätt",
    "Ställa in en ergonomisk och säker körställning",
    "Identifiera och förstå fordonets varnings- och kontrollampor"
  ],
  "Miljömedveten körning": [
    "Planera din körning för en jämn fart och undvika onödiga stopp",
    "Utnyttja fordonets rörelseenergi och motorbroms",
    "Välja växel och varvtal som ger låg förbrukning (EcoDriving)",
    "Undvika onödig tomgångskörning och kraftiga accelerationer"
  ],
  "Passagerarvänlig körning": [
    "Köra mjukt och behagligt med hänsyn till passagerarkomfort",
    "Anpassa hastigheten i kurvor så att sidokrafter minimeras",
    "Accelerera och bromsa mjukt och förutsägbart",
    "Ta hänsyn till passagerare vid på- och avstigning"
  ],
  "Handlings- och omdömesförmåga": [
    "Göra säkra riskbedömningar i svåra trafiksituationer",
    "Agera lugnt och med gott omdöme vid oväntade händelser",
    "Förutse risker och konsekvenser av ditt agerande",
    "Hålla tillräckliga säkerhetsmarginaler till andra trafikanter"
  ]
};

// Kompetensområden för spårtrafik. Lokförare följer TSFS 2011:60
// (rullande materiel, infrastruktur/trafiksäkerhetsinstruktion, språk),
// spårvagn och tunnelbana har egna områden för stads- och gatumiljö.
export const RAIL_DEFICIENCIES: Record<string, string[]> = {
  "Rullande materiel och kontroller före avgång": [
    "Utföra kontroller och prov före avgång",
    "Genomföra bromsprov korrekt",
    "Kontrollera tågets sammansättning, bromsvikt och bromsprocent",
    "Använda reglage, ATC/ETCS och säkerhetsutrustning på rätt sätt",
    "Upptäcka, rapportera och åtgärda fel på fordonet",
  ],
  "Framförande och hastighetsanpassning": [
    "Anpassa hastigheten efter banans egenskaper och största tillåtna hastighet",
    "Följa tillfälliga hastighetsnedsättningar och banarbeten",
    "Ta hänsyn till tågets vikt, bromsförmåga och lutning",
    "Stanna på rätt plats vid plattform och signal",
    "Köra energisnålt med utrullning och rätt fartnivå",
  ],
  "Signaler och trafiksäkerhetsinstruktion": [
    "Uppfatta och tolka signaler korrekt",
    "Respektera stoppsignal och tillstånd att passera",
    "Tillämpa reglerna för tågfärd, spärrfärd och växling",
    "Följa trafiksäkerhetsinstruktionen",
    "Hantera ATC/ETCS-ingrepp och körning i nedsatt läge",
  ],
  "Linjekännedom": [
    "Känna till banans lutningar, kurvor och driftplatser",
    "Planera körningen efter linjens förutsättningar",
    "Känna till plankorsningar och andra riskpunkter längs banan",
  ],
  "Kommunikation": [
    "Kommunicera tydligt med tågklarerare och trafikledning",
    "Använda rätt fraseologi och kvittera order",
    "Rapportera avvikelser och händelser",
    "Informera resenärer vid störning",
  ],
  "Onormala situationer och nödläge": [
    "Agera korrekt vid fel, störning och signal i stopp",
    "Skydda tåget och olycksplatsen",
    "Larma och utrymma på rätt sätt",
    "Säkra tåget mot oavsiktlig rörelse",
  ],
  // Spårvagn och tunnelbana
  "Fordon och kontroller": [
    "Klargöra fordonet och göra avgångskontroll",
    "Utföra bromsprov",
    "Använda reglage, sandning och nödbroms på rätt sätt",
    "Hantera dörrar och tillgänglighet för resenärer",
  ],
  "Manövrering och hastighet": [
    "Anpassa hastigheten efter sikt och trafik (siktfart)",
    "Bromsa mjukt med hänsyn till stående resenärer",
    "Stanna exakt vid hållplats och plattform",
    "Köra energisnålt och jämnt",
  ],
  "Signaler och trafikregler": [
    "Följa spårvägens signaler och tecken",
    "Tillämpa trafikreglerna i blandtrafik",
    "Kontrollera växelläge och hantera växlar",
    "Respektera företräde och väjningsplikt",
  ],
  "Samspel och trafiksäkerhet": [
    "Uppmärksamma gående och cyklister i tid",
    "Förutse andra trafikanters beteende",
    "Hålla säkerhetsmarginaler i gatumiljö",
    "Varna med klocka eller signal i tid",
  ],
  "Kommunikation och onormala situationer": [
    "Kommunicera med trafikledningen",
    "Agera vid hinder, olycka och strömlöst läge",
    "Utrymma fordonet och ta hand om resenärer",
  ],
};

const LOK_AREAS = [
  "Rullande materiel och kontroller före avgång",
  "Framförande och hastighetsanpassning",
  "Signaler och trafiksäkerhetsinstruktion",
  "Linjekännedom",
  "Kommunikation",
  "Onormala situationer och nödläge",
];
const TRAM_AREAS = [
  "Fordon och kontroller",
  "Manövrering och hastighet",
  "Signaler och trafikregler",
  "Samspel och trafiksäkerhet",
  "Kommunikation och onormala situationer",
];

/** Kompetensområden som går att välja för en behörighet */
export function areasForLicense(license: string | undefined): string[] {
  if (license?.startsWith('Lokförare')) return LOK_AREAS;
  if (license === 'Spårvagn' || license === 'Tunnelbana') return TRAM_AREAS;
  const all = failureCategories.areas;
  return license === 'TAXI' ? all : all.filter(a => !TAXI_ONLY_AREAS.includes(a));
}

/** Området som säkerhetskontrollen/fordonskontrollen hör till */
export function vehicleAreaForLicense(license: string | undefined): string {
  if (license?.startsWith('Lokförare')) return LOK_AREAS[0];
  if (license === 'Spårvagn' || license === 'Tunnelbana') return TRAM_AREAS[0];
  return 'Fordonskännedom';
}

// Sorterar valda brister i listans ordning (nya formuleringar först), som i
// Trafikverkets protokoll – oavsett i vilken ordning de klickades i
export function sortByCatalog(area: string, selected: string[]): string[] {
  const order = [
    ...(newLayoutDeficiencies[area] || []),
    ...((failureCategories.deficiencies as Record<string, string[]>)[area] || []),
    ...(RAIL_DEFICIENCIES[area] || []),
  ];
  const rank = (d: string) => {
    const i = order.indexOf(d);
    return i === -1 ? order.length : i;
  };
  return [...selected].sort((a, b) => rank(a) - rank(b));
}

// Valbara brister för ett område, uppdelat i grupper för formuläret
export function deficiencyGroups(area: string, newLayout: boolean): { label?: string; items: string[] }[] {
  // Spårtrafikens områden har bara en uppsättning formuleringar
  if (RAIL_DEFICIENCIES[area]) return [{ items: RAIL_DEFICIENCIES[area] }];
  const classic = (failureCategories.deficiencies as Record<string, string[]>)[area] || [];
  if (!newLayout) return [{ items: classic }];
  const fresh = newLayoutDeficiencies[area] || [];
  return [
    { label: 'Nya formuleringar', items: fresh },
    { label: 'Tidigare formuleringar', items: classic.filter(d => !fresh.includes(d)) },
  ].filter(g => g.items.length > 0);
}

export const failureSituations = [
  "Backning", "Parkering", "Körfält", "Körfältsbyte", "Gatukorsning", 
  "Signalreglerad korsning", "Cirkulationsplats", "Motorväg/motortrafikled", 
  "Landsväg", "Infart på landsväg", "Sväng från landsväg", "Oskyddade trafikanter", 
  "Körning mot mål", "Stillastående fordon/hinder", "Möte/omkörning", 
  "Omkörning", "Möte", "Vändning", "Vändning med manövrering", "Säkerhetskontroll", 
  "Smal/krokig väg", "Start från vägkant", "Start i lutning", "Körställning", 
  "Användande av reglage", "Järnväg/Spårvägskorsning", "Vägarbetsområde",
  "Lågfart", "Högfart", "Bromsning", "Manövrering och uppställning",
  "Passagerarvänlig bromsning", "Stannande"
];
