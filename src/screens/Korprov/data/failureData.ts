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

// Formuleringar i Trafikverkets nya protokoll ("Du måste bli bättre på:").
// Visas bara när provet görs med ny provlayout, före de tidigare formuleringarna.
// Bekräftade från ett riktigt protokoll: de tre första under Trafiksäkerhet och beteende.
// Övriga är skrivna i samma stil och bör stämmas av mot fler nya protokoll.
export const newLayoutDeficiencies: Record<string, string[]> = {
  "Trafiksäkerhet och beteende": [
    "Planera din körning efter det du ser",
    "Samspela väl med andra trafikanter",
    "Välja rätt placering",
    "Anpassa hastigheten efter situationen",
    "Hålla tillräckliga säkerhetsmarginaler",
    "Upptäcka och bedöma risker i tid",
    "Ha god uppsikt runt fordonet",
    "Visa hänsyn till oskyddade trafikanter",
    "Anpassa körningen efter väglag och sikt"
  ],
  "Manövrering": [
    "Manövrera fordonet mjukt och under kontroll",
    "Hantera reglagen rutinmässigt",
    "Styra med god precision",
    "Anpassa manövreringen till utrymme och hinder",
    "Bromsa effektivt och kontrollerat",
    "Backa och parkera med god uppsikt"
  ],
  "Trafikregler": [
    "Följa väjningsplikt och stopplikt",
    "Följa hastighetsbegränsningarna",
    "Följa vägmärken, trafiksignaler och vägmarkeringar",
    "Följa reglerna vid körfältsbyte och sammanvävning",
    "Följa reglerna i cirkulationsplatser",
    "Lämna företräde vid övergångsställen och cykelpassager"
  ],
  "Fordonskännedom": [
    "Kontrollera fordonets skick",
    "Upptäcka fel och föreslå åtgärder",
    "Förklara varför kontrollen är viktig för trafiksäkerheten",
    "Använda fordonets reglage och hjälpsystem rätt",
    "Ställa in en säker körställning"
  ],
  "Miljömedveten körning": [
    "Planera din körning för en jämn fart",
    "Utnyttja fordonets rörelseenergi",
    "Välja växel och varvtal som ger låg förbrukning",
    "Undvika onödig tomgång och onödiga accelerationer"
  ],
  "Passagerarvänlig körning": [
    "Köra mjukt och behagligt för passagerarna",
    "Anpassa hastigheten i kurvor efter passagerarna",
    "Accelerera och bromsa mjukt",
    "Ta hänsyn till passagerare vid på- och avstigning"
  ],
  "Handlings- och omdömesförmåga": [
    "Göra säkra bedömningar i svåra trafiksituationer",
    "Agera lugnt och korrekt vid oväntade händelser",
    "Förutse risker och konsekvenser av ditt agerande",
    "Hålla tillräckliga säkerhetsmarginaler"
  ]
};

// Sorterar valda brister i listans ordning (nya formuleringar först), som i
// Trafikverkets protokoll – oavsett i vilken ordning de klickades i
export function sortByCatalog(area: string, selected: string[]): string[] {
  const order = [
    ...(newLayoutDeficiencies[area] || []),
    ...((failureCategories.deficiencies as Record<string, string[]>)[area] || []),
  ];
  const rank = (d: string) => {
    const i = order.indexOf(d);
    return i === -1 ? order.length : i;
  };
  return [...selected].sort((a, b) => rank(a) - rank(b));
}

// Valbara brister för ett område, uppdelat i grupper för formuläret
export function deficiencyGroups(area: string, newLayout: boolean): { label?: string; items: string[] }[] {
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
