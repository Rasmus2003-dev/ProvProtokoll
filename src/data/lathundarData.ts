export interface LathundDocument {
  id: string;
  tdok: string;
  title: string;
  subtitle: string;
  category: 'korprov_tung' | 'teoriprov' | 'korprov_grund';
  date: string;
  version: string;
  sections: {
    id: string;
    title: string;
    content: string;
    bullets?: string[];
    table?: { headers: string[]; rows: string[][] };
    highlights?: string[];
  }[];
}

export const LATHUNDAR_DATA: LathundDocument[] = [
  {
    id: 'tdok-2018-0587',
    tdok: 'TDOK 2018:0587',
    title: 'Körprov Grund (B, A, Taxi m.fl.)',
    subtitle: 'Rutinbeskrivning för förarprovsinspektörer vid genomförande och bedömning av körprov B.',
    category: 'korprov_grund',
    date: '2024-10-02',
    version: '10.0',
    sections: [
      {
        id: 'syfte',
        title: '1. Syfte och Omfattning',
        content: 'Körproven ska genomföras på ett kundvänligt, likvärdigt och rättssäkert sätt så att Trafikverket upplevs förtroendeingivande, lyhörda och tydliga. Baserad på TSFS 2011:20, TSFS 2012:41 och TSFS 2012:43.',
        bullets: [
          'Gäller körprov B samt som grundrutin för övriga körkortsbehörigheter.',
          'Inspektören ansvarar för att skapa trygghet och ha god kontakt med kunden under hela provet.'
        ]
      },
      {
        id: 'mote',
        title: '2. Förberedelser, ID-kontroll & Första Mötet',
        content: 'Inspektören ska förbereda sig väl och vid omprov kontrollera föregående protokoll.',
        bullets: [
          'Hälsa välkommen och presentera dig empatiskt (förklara att du förstår om det finns nervositet).',
          'Säkerställ identiteten: Kontrollera att det är samma legitimation som vid kunskapsprovet.',
          'Verifiera giltighet, foto, manipulering och att namnteckningen stämmer överens med EES-intygandet.',
          'Informera kunden om Trafikverksbilen: stol, ratt, speglar, p-broms, torkare, elbilsegenskaper samt alkolås.'
        ]
      },
      {
        id: 'kortid',
        title: '3. Körtid & Inledning',
        content: 'Kunden ska köra mot angivet mål eller efter angiven färdväg i sammanlagt minst 25 minuter.',
        highlights: [
          'CRITICAL: Tiden för säkerhetskontroll och särskilt manöverprov räknas INTE in i de 25 minuterna ren körtid!',
          'Fördelning: Cirka 10–20 minuter i tätort och 10–20 minuter utanför tätort.',
          'Minst 2 manöverprov ska genomföras, varav ett MÅSTE vara backning.'
        ],
        bullets: [
          'Om körtiden inte når 25 min pga låg färdighet är provet underkänt. Överväg om provet ska avbrytas.',
          'Om körtiden understiger 25 min pga olycka/fordonsfel registreras "Körprov ej utfört".'
        ]
      },
      {
        id: 'sakerhet',
        title: '4. Säkerhetskontroll (B)',
        content: 'Genomförs vid förstagångsprov och vid behov vid omprov.',
        bullets: [
          'Ge kunden en eller flera valda delar i uppgift (t.ex. mönsterdjup på däck, halvljus, bromsljus, spolarvätska).',
          'Kunden utför kontrollen praktiskt. Om brister upptäcks ska kunden ge förslag på åtgärder.',
          'Vid behov ställer förarprövaren motiverande och förklarande frågor om vad som kontrolleras och varför.'
        ]
      },
      {
        id: 'provpunkter',
        title: '5. Provpunkter & Bedömningskriterier',
        content: 'En underkänd provpunkt kan markeras även om den inte uppfyller kriteriet. Flera provpunkter kan bedömas i samma trafiksituation.',
        table: {
          headers: ['Provpunkt', 'Krav & Genomförande', 'Bedömningsgrund'],
          rows: [
            ['Körställning', 'Inställning av stol, ratt och backspeglar.', 'Rätt ergonomi & sikt.'],
            ['Effektiv bromsning', 'Genomförs från lägst 50 km/h till stillastående.', 'Säker, kraftfull inbromsning.'],
            ['Backning (Obligatoriskt)', 'Backning med sväng (höger/vänster) med rakbackning före/efter.', 'Uppsikt, krypande fart, placering.'],
            ['Parkering', 'Fickparkering, inbackning eller inkörning.', 'Planering & manövreringsförmåga.'],
            ['Start i lutning / Vändning', 'Spontant eller beordrat i med- eller motlut.', 'Kopplingskontroll, rullningsfrihet.'],
            ['Cirkulationsplats & Korsning', 'Variera utformning, körfältsval & regler.', 'Avsökning, väjningsplikt, teckengivning.'],
            ['Landsväg & Omkörning', 'Placering, fartanpassning vid möte, sväng från landsväg.', 'Planering, avstånd, spegelrutin.']
          ]
        }
      },
      {
        id: 'feedback',
        title: '6. Resultatdelgivning & Feedback',
        content: 'Meddela resultatet direkt vid provets slut och skicka det digitala protokollet.',
        bullets: [
          'Godkänt prov: Ge positiv feedback på starka områden. Påminn om att legitimation gäller i Sverige upp till 2 månader tills körkortet kommer.',
          'Underkänt prov: Informera muntligt och visuellt. Beskriv kompetensområden med brister, grundorsak (kursplanemål) samt konsekvenser.',
          'Erbjud tips inför fortsatt övningskörning (hur de övar, var de övar, självständighet).'
        ]
      }
    ]
  },
  {
    id: 'tdok-2018-0589',
    tdok: 'TDOK 2018:0589',
    title: 'Körprov (B)96, BE, C1, C1E, C, CE, D1, D1E, D och DE',
    subtitle: 'Specialrutin för utökad B, tungt släp, lastbil och buss.',
    category: 'korprov_tung',
    date: '2024-10-02',
    version: '8.0',
    sections: [
      {
        id: 'tung_syfte',
        title: '1. Syfte & Automatregler',
        content: 'Rutin för genomförande av körprov med tunga fordon och fordonskombinationer baserad på Transportstyrelsens föreskrifter TSFS 2024:23 m.fl.',
        bullets: [
          'B-körkort utan villkor automat ger möjlighet att köra automatfordon på prov för BE/C/CE utan att få automatvillkor i körkortet.',
          'Innehavare av B med villkor automat kan häva villkoret genom att genomföra provet med manuell växellåda.'
        ]
      },
      {
        id: 'fordonskrav',
        title: '2. Sammanställning av Fordonskrav (Bilaga 1)',
        content: 'Tabell över minimikrav för provfordon enligt föreskrifterna:',
        table: {
          headers: ['Behörighet', 'Dragfordon / Vikt', 'Släp / Kombinationskrav', 'Lastkrav'],
          rows: [
            ['(B)96', 'Personbil / Lätt lastbil', 'Släp > 750 kg, Totalvikt 3500-4250 kg', 'Lastat till minst 1/2 maximilast'],
            ['BE', 'Tjänstevikt min 1000 kg, totalvikt max 3500 kg', 'Släp totalvikt 1000-3500 kg, kombination > 3500 kg', 'Minst 1/2 maximilast, bruttovikt min 800 kg'],
            ['C1 / C1E', 'Totalvikt 4000-7500 kg, min 5 m längd', 'C1E släp min 1250 kg, totallängd min 8 m', 'Minst 1/2 maximilast, styckegods'],
            ['C', 'Totalvikt min 16 000 kg, min 8 m, bredd 2.4 m', 'Höjd min 3.5 m, färdskrivare, ABS', 'Minst 2/3 av tillåten lastvikt BK1'],
            ['CE', 'Lastbil min 16 ton + Släpvagn min 18 ton', 'Totallängd min 18 m (eller semitrailer min 16 m)', 'Minst 2/3 av tillåten lastvikt BK1'],
            ['D1 / D', 'Buss min 4000 kg (D1) / min 10 m (D)', 'Färdskrivare, ABS, bilbälten', 'Passagerarsäten (D1 max 16 pass)']
          ]
        }
      },
      {
        id: 'manovrer_tung',
        title: '3. Särskilda Manövrer i Trafik',
        content: 'Ingår i samtliga tunga behörigheter. Förarprövaren är tillgänglig som backhjälp.',
        bullets: [
          'Backning med samtidig svängning (Obs: att enbart backa rakt uppfyller inte kravet!).',
          'Stanna säkert för lastning och lossning vid lastramp/brygga (C1, C1E, C, CE).',
          'Stanna för säker av- och påstigning för passagerare vid busshållplats/ficka (D1, D, D1E, DE).'
        ]
      },
      {
        id: 'sakerhet_tung',
        title: '4. Säkerhetskontroll för BE & Tunga Behörigheter',
        content: 'Skall utföras självständigt och systematiskt med tydligt riskmedvetande.',
        highlights: [
          'För BE ska följande 3 punkter ALLTID ingå (även vid omprov): 1) Att dörrarna är stängda, 2) Last (säkring, placering, mängd, regbevis), 3) Kopplingsanordning, katastrofbromsvajer, bromsar & elanslutning.',
          'För C/CE/D/DE ingår hel säkerhetskontroll: Tryckluftssystem, färdbroms, parkeringsbroms, katastrofbroms, däck/hjulbultar, färdskrivare, spärrventiler, vätskor och nödutgångar.'
        ]
      },
      {
        id: 'sammankoppling',
        title: '5. Sammankoppling & Registreringsbevis',
        content: 'Sökanden skall kunna utföra till- och frånkoppling av släp samt redogöra för registreringsbevisets data.',
        bullets: [
          'Koppla samman och isär släpet på ett säkert, riskmedvetet och rutinmässigt sätt.',
          'Kunna beräkna tillåten lastvikt, tågvikt, axeltryck och bärighetsklasser (BK1, BK2, BK3, BK4) via registreringsbeviset.'
        ]
      }
    ]
  },
  {
    id: 'tdok-2018-0583',
    tdok: 'TDOK 2018:0583',
    title: 'Kunskapsprov Grund (Teoriprov)',
    subtitle: 'Rutinbeskrivning för förarprovspersonal vid insläpp, ID-kontroll och övervakning av kunskapsprov.',
    category: 'teoriprov',
    date: '2024-03-14',
    version: '12.0',
    sections: [
      {
        id: 'teori_inledning',
        title: '1. Insläpp & ID-kontroll i Provlokalen',
        content: 'Noggrann kontroll ska göras inför varje provpass.',
        bullets: [
          'Uppdatera provförteckningen i FPS.',
          'Kontrollera ID-handling: 1) Rätt typ av godkänd handling, 2) Fotot är välliknande, 3) Handlingen är giltig, 4) Inte manipulerad, 5) Personnummer stämmer med digital utrustning, 6) Namnteckning stämmer.',
          'Kunden ska intyga att hen inte har körkort utfärdat i annan EES-stat.',
          'Mobiltelefoner och teknisk utrustning ska vara HELT AVSTÄNGDA (inte bara flygplansläge) och förvaras i skåp/väska.'
        ]
      },
      {
        id: 'forlangd_provtid',
        title: '2. Förlängd Provtid & Hjälpmedel',
        content: 'Regler för anpassade prov och godkända hjälpmedel.',
        bullets: [
          'Förlängd provtid utökas med 50 % av den normala provtiden.',
          'Tillåtna hjälpmedel: Trafikverkets miniräknare är tillåten vid samtliga prov.',
          'Lexikon (översättning av ord) är tillåtet vid körkortsbehörigheter efter noggrann kontroll av provförrättaren (inga anteckningar/lappar). Ordböcker (förklaring av ord) är INTE tillåtna.'
        ]
      },
      {
        id: 'fusk_rutin',
        title: '3. Hantering av Misstänkt Fusk',
        content: 'Som fusk räknas användning av otillåtna hjälpmedel (dolda hörsnäckor, telefoner, kamerautrustning) eller försöka vilseleda.',
        highlights: [
          'Om misstanke om fusk uppstår är det ett HINDER FÖR PROV och kunden ska omedelbart avvisas!',
          'Informera kunden: Pågående prov avbryts och ogiltigförklaras, alla bokade prov avbokas, spärr mot bokning införs, polisanmälan om osann försäkran upprättas.',
          'Kunden kan stängas av från förarprov i 1 till 2 år enligt lag!'
        ]
      },
      {
        id: 'tekniska_fel',
        title: '4. Tekniska Problem & Störningar',
        content: 'Åtgärder vid IT-störningar i provlokalen.',
        bullets: [
          'Driftstörningar anmäls till Användarstöd IT för Förarprov på 010-123 30 30.',
          'Vid kortare avbrott: Kunden sitter kvar, och provtiden förlängs motsvarande stoppet.',
          'Vid längre avbrott görs avgiftsfri ombokning.'
        ]
      }
    ]
  },
  {
    id: 'tdok-2018-0588',
    tdok: 'TDOK 2018:0588',
    title: 'Körprov Motorcykel (A1, A2, A)',
    subtitle: 'Rutinbeskrivning och bedömningsdirektiv för behörighet A1, A2 och A.',
    category: 'korprov_grund',
    date: '2024-05-15',
    version: '9.0',
    sections: [
      {
        id: 'mc_sakerhet',
        title: '1. Säkerhetskontroll Motorcykel',
        content: 'Systematisk kontroll av motorcykeln innan körning.',
        bullets: [
          'Bromssystem: Fram- och bakbroms (tryckpunkt, läckage, belägg, bromsvätskenivå).',
          'Däck och fälg: Lufttryck, mönsterdjup (minst 1 mm), skador, eker- och fälgkondition.',
          'Drivpaket: Kedjespänning, smörjning, slitage på kedja och drev.',
          'Belysning och reflexer: Halvljus, helljus, bromsljus, blinkers och nödstoppskontakt.',
          'Styrlager och fjädring: Glapp i styrlager, framgaffeltätningar och stötdämpare.'
        ]
      },
      {
        id: 'mc_manover',
        title: '2. Särskilt Manöverprov (Bana)',
        content: 'Manöverprovet genomförs på inhägnat område före körning i trafik.',
        highlights: [
          'Lågfartsbana: Balans, kopplingskontroll vid krypfart, blickteknik och styrning.',
          'Högfartsbana (50 km/h): Undanmanöver, slalom och kontrollerad acceleration/bromsning.',
          'Bromsprov: Effektiv och kontrollerad inbromsning från 70 km/h och 90 km/h till stillastående.'
        ]
      },
      {
        id: 'mc_trafik',
        title: '3. Körning i Trafik',
        content: 'Minst 25 minuter effektiv körning i varierad trafikmiljö.',
        bullets: [
          'Placering: Aktivt spårval för maximal sikt, framkomlighet och skyddsavstånd.',
          'Avsökning: Rörlig blick, speglar och döda vinkeln vid alla sidledsförflyttningar.',
          'Kurvteknik: Rätt hastighet före kurva, nedlägg och accelerationsfas ut ur kurvan.'
        ]
      }
    ]
  },
  {
    id: 'tdok-bedomning-trafiklarare',
    tdok: 'TDOK Bedömning & TSFS 2012:41',
    title: 'Bedömningsprov & Trafiklärarutbildning',
    subtitle: 'Kriterier för bedömningsprov vid ansökan till trafiklärarutbildning samt inspektörsprövning.',
    category: 'korprov_grund',
    date: '2024-09-01',
    version: '6.0',
    sections: [
      {
        id: 'bedomning_syfte',
        title: '1. Syfte med Bedömningsprov',
        content: 'Bedömningsprov genomförs för att intyga att föraren besitter en exceptionellt hög pedagogisk och trafiksäker körkompetens.',
        highlights: [
          'Ingen förarbehörighet utfärdas vid godkänt prov ("Ingen behörighet uppnådd").',
          'Godkänt protokoll används som formellt intyg för behörighetsprövning till trafiklärarutbildning och vidare utbildning till förarprövare/inspektör.'
        ]
      },
      {
        id: 'bedomning_krav',
        title: '2. Kompetens- och Bedömningskrav',
        content: 'Kandidaten bedöms utifrån ett professionellt instruktörsperspektiv.',
        bullets: [
          'Rutiner och samspel: Felfri avsökning, förutseende körsätt och tydlig kommunikation med medtrafikanter.',
          'Ekokörning (EcoDriving): Optimal växlingsteknik, motorbromsning och framförhållning.',
          'Regeltillämpning: Perfekt efterlevnad av gällande trafikregler, väjningsregler och hastighetsgränser.'
        ]
      }
    ]
  }
];

