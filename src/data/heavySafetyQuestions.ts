export type HeavyLicenseCode = 'C1' | 'C' | 'C1E' | 'CE' | 'D1' | 'D' | 'D1E' | 'DE';

export interface FollowUpQuestion {
  question: string;
  acceptableAnswer: string;
  riskAspect?: string;
}

export interface HeavySafetyQuestion {
  id: number;
  category: 'Däck & Hjul' | 'Bromssystem & Tryckluft' | 'Färdskrivare' | 'Kopplingsanordning' | 'Styrning & Vätskor' | 'Allmän Fordonskontroll';
  question: string;
  answer: string;
  keyPoints?: string[];
  /** Vilka behörigheter frågan är relevant för */
  applicableLicenses?: HeavyLicenseCode[];
  /** Beskrivning av fordonstyp/fokus för frågan */
  vehicleFocus?: string;
  difficulty?: 'Bas' | 'Fördjupning' | 'Teknisk';
  /** Typiska följdfrågor som inspektören kan ställa (t.ex. risker, åtgärder, konsekvenser) */
  followUpQuestions?: FollowUpQuestion[];
}

export const HEAVY_SAFETY_QUESTIONS_76: HeavySafetyQuestion[] = [
  {
    id: 1,
    category: 'Däck & Hjul',
    question: 'Vad ska du kontrollera på däcken vid säkerhetskontroll?',
    answer: 'Att det inte fastnat något mellan däcken i tvillingmontage. Kontrollera lufttryck, mönsterdjup, skador eller sprickor, däcktyp, att fälgen ser bra ut, ingen rost runt muttrarna, att alla muttrar sitter fast och att stänkskydden sitter fast.',
    keyPoints: ['Inget mellan tvillingdäck', 'Mönsterdjup & lufttryck', 'Inga skador/sprickor', 'Hjulmuttrar & ingen rost', 'Stänkskydd fast'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Alla tunga fordon',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilka är de direkta riskerna om en sten sitter fastkilad mellan tvillingdäcken under motorvägskörning?',
        acceptableAnswer: 'Stenen kan slungas iväg i hög hastighet och träffa bakomvarande fordons vindruta med dödlig utgång, eller nöta hål på däckets stomme så däcket exploderar under färd.',
        riskAspect: 'Projektilrisk mot medtrafikanter & plötslig däckexplosion i hög fart'
      },
      {
        question: 'Vad riskerar du om du kör med ojämnt slitage eller för lågt lufttryck?',
        acceptableAnswer: 'Överhettning av däcket vilket leder till separation av slitbanan eller däckbrand, samt markant ökad bromssträcka och instabilt ekipage vid en undanmanöver.',
        riskAspect: 'Däckbrand & förlorad fordonskontroll'
      }
    ]
  },
  {
    id: 2,
    category: 'Bromssystem & Tryckluft',
    question: 'När du genomför en täthetskontroll upptäcker du att läckaget är för stort, vilket innebär körförbud. Hur kan du häva detta körförbud för att ta dig till verkstad?',
    answer: 'Starta motorn med foten på färdbromsen och parkeringsbromsen lossad. Om kompressorn lyckas bygga upp och hålla fullt arbetstryck på tomgång kan du köra till närmaste verkstad.',
    keyPoints: ['Starta motor på tomgång', 'Färdbroms nertryckt + P-broms lossad', 'Måste bygga upp fullt arbetstryck', 'Endast till närmaste verkstad'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Tryckluftsbromsar (Alla)',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vilken är den yttersta risken med att ignorera ett stort luftläckage och ge sig ut på vägen?',
        acceptableAnswer: 'Att kompressorn inte orkar mata luft vid upprepade inbromsningar, varvid trycket faller till lågtrycksnivå och spärrventilen slår till så fjäderbromsen tvärnitar hjulen mitt på vägen eller att färdbromsen helt slutar ta.',
        riskAspect: 'Plötslig ofrivillig tvärnitning eller total bromsförlust mitt i trafikflödet'
      }
    ]
  },
  {
    id: 3,
    category: 'Färdskrivare',
    question: 'Hur många pappersrullar ska du ha med i reserv vid färd med digital färdskrivare?',
    answer: 'Minst 6 pappersrullar (så du kan skriva ut de senaste 56 dagarna samt innevarande dag och eventuella kontroller).',
    keyPoints: ['Minst 6 pappersrullar', 'Täcker 56 dagar bakåt + idag'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdskrivare',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad riskerar du vid en flygande poliskontroll om du saknar reservrullar eller inte kan skriva ut?',
        acceptableAnswer: 'Böter och sanktionsavgift för bristande färdskrivarutrustning, samt risk för förbud mot fortsatt färd tills giltiga remsor anskaffats.',
        riskAspect: 'Sanktionsavgifter & omedelbart körförbud'
      }
    ]
  },
  {
    id: 4,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur kan du kontrollera att lufttorken fungerar?',
    answer: 'Lyssna efter "nysningen" (avlastningen) när kompressorn når fullt arbetstryck i botten på torken.',
    keyPoints: ['Lyssna efter nysning', 'Sker vid fullt arbetstryck', 'Avlastningsventil öppnar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Tryckluftstork',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken om avlastningsventilen aldrig blåser ut kondensvattnet?',
        acceptableAnswer: 'Vatten och oljeklumpar pressas vidare in i fyrkretsskyddsventilen och bromsklockorna. På vintern fryser vattnet till is vilket blockerar ventiler och slår ut bromsverkan helt.',
        riskAspect: 'Isproppar och totalt bromsbortfall vintertid'
      }
    ]
  },
  {
    id: 5,
    category: 'Färdskrivare',
    question: 'Hur ofta ska din färdskrivare besiktigas och var hittar du information om när den senast besiktigades?',
    answer: 'Var 24:e månad (vartannat år) på ackrediterad verkstad. Kontrollmärket sitter fäst i lastbilens B-stolpe på förarsidan (eller på utskriftsremsan).',
    keyPoints: ['Var 24:e månad (vartannat år)', 'Ackrediterad verkstad', 'Kontrollmärke på B-stolpe'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdskrivare',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilka risker och påföljder finns om kalibreringsintervallet på 2 år har passerats?',
        acceptableAnswer: 'Fordonet betraktas som icke godkänt för yrkesmässig trafik, böter utdöms och färdskrivarens data underkänns som bevis i kör- och vilotidsrapportering.',
        riskAspect: 'Underkänd dokumentation och böter för åkeri & förare'
      }
    ]
  },
  {
    id: 6,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad innebär det för dig om nysningen i lufttorken uteblir?',
    answer: 'Det innebär att avlastningsventilen i botten är igensatt eller trasig. Fukt och kondens hamnar då i bromssystemet vilket kan orsaka frysning på vintern (med risk för totalt bromsbortfall) eller skada ventiler och gummipackningar. Innebär körförbud tills det åtgärdats.',
    keyPoints: ['Igensatt bottenventil', 'Vatten i bromssystemet', 'Frysrisk & förstörda ventiler', 'Körförbud'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Tryckluftstork',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Får du köra vidare med last om du upptäcker att torken inte avlastar?',
        acceptableAnswer: 'Nej, fordonet har formellt körförbud tills torken åtgärdats, eftersom säkerhetsmarginalerna i bromssystemet snabbt äventyras.',
        riskAspect: 'Körförbud och förhöjd olycksrisk'
      }
    ]
  },
  {
    id: 7,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur genomför du ett 30-sekunderstest på bromssystemet?',
    answer: 'Se till att trycket är över 6 bar. Stäng av motorn, öppna fönster/dörr, trampa ner färdbromsen och lossa parkeringsbromsen. Under 30 sekunder får manometrarna inte tappa tryck (max 0,5 bar tillåtet) och inget pysande läckage får höras utanför.',
    keyPoints: ['Minst 6 bar', 'Motor avstängd, fönster öppet', 'Färdbroms nertryckt, P-broms lossad', 'Max 0,5 bar tryckfall på 30 sek', 'Inget hörbart läckage'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Tryckluftsbromsar',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad innebär det om trycket faller snabbare än tillåtet när du trampar ner bromspedalen?',
        acceptableAnswer: 'Det tyder på läckage i manöverkretsen, trasiga bromsmembran, sprucken bromsslang eller defekt pedalventil.',
        riskAspect: 'Risk att tryckluften töms under inbromsning med utebliven bromsverkan'
      }
    ]
  },
  {
    id: 8,
    category: 'Kopplingsanordning',
    question: 'Vad använder du för att mäta slitage på en bygelkoppling / kopplingsanordning?',
    answer: 'En kontrolltolk (slitagetolk).',
    keyPoints: ['Kontrolltolk'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Kopplingsanordning (Släp)',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken med att köra med en koppling där slitaget överstiger tolkens maxmått?',
        acceptableAnswer: 'Släpets dragögla kan hoppa ur eller slita sönder bulten vid kraftig inbromsning eller acceleration vilket medför att släpet lossnar och skenar.',
        riskAspect: 'Katastrofal separation av släpekipaget i trafik'
      }
    ]
  },
  {
    id: 9,
    category: 'Kopplingsanordning',
    question: 'Vilka två huvudtyper av bygelkopplingar finns det?',
    answer: 'Lagrad koppling och Olagrad koppling (kärrsäker).',
    keyPoints: ['Lagrad', 'Olagrad (kärrsäker)'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Bygelkoppling (Släp)',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vad händer om du kopplar en släpkärra (med stel bom) till en lagrad (icke-kärrsäker) koppling?',
        acceptableAnswer: 'Kopplingens lagring och gummielement bryts sönder av de vertikala krafterna, vilket leder till materialutmattning och haveri.',
        riskAspect: 'Strukturellt brott och tappat släp'
      }
    ]
  },
  {
    id: 10,
    category: 'Kopplingsanordning',
    question: 'Vad menas med en kärrsäker koppling (olagrad koppling)?',
    answer: 'Den kan ta upp nedåtgående och vertikala krafter från släpkärra med stel dragstång (samt släpvagn).',
    keyPoints: ['Klarar vertikala / nedåtgående krafter', 'För släpkärra med stel dragstång'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Koppling (Släpkärra)',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Varför genererar en kärra med stel dragstång vertikala krafter på kopplingen under körning?',
        acceptableAnswer: 'Eftersom kärran tippar fram och tillbaka vid gupp och inbromsningar överförs kultryck och dynamiska vertikala stötar direkt till bilens dragbalk.',
        riskAspect: 'Knäckning av dragbalk vid felaktig utrustning'
      }
    ]
  },
  {
    id: 11,
    category: 'Kopplingsanordning',
    question: 'Hur stort får det vertikala glappet vara i bygelkopplingen?',
    answer: 'Maximalt 5 mm.',
    keyPoints: ['Max 5 mm'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Koppling (Släp)',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vilka risker uppstår vid för stort vertikalt glapp vid guppig vägbana?',
        acceptableAnswer: 'Slitaget eskalerar exponentiellt genom ständiga slag och stötar, vilket kan slita av låsmekanismen och leda till att kopplingsbulten kilar fast eller slits av.',
        riskAspect: 'Metallutmattning och förlorad dragförbindelse'
      }
    ]
  },
  {
    id: 12,
    category: 'Kopplingsanordning',
    question: 'Hur stort får slitaget maximalt vara på kopplingsbulten?',
    answer: 'Maximalt 2 mm slitage från ursprungsmåttet (exempelvis från 57 mm till 55 mm eller 50 mm till 48 mm beroende på bulttyp).',
    keyPoints: ['Max 2 mm'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Kopplingsbult (Släp)',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vad är risken om slitaget på bulten är 4 mm och du gör en kraftig panikinbromsning med 40 ton i släpet?',
        acceptableAnswer: 'Bulten kan utsättas för skjuvbrott (gå av) på grund av försvagad dimension och de kraftiga rycken som bildas av glappet.',
        riskAspect: 'Skjuvbrott på bult och skenande släp'
      }
    ]
  },
  {
    id: 13,
    category: 'Kopplingsanordning',
    question: 'Hur stort får slitaget maximalt vara på släpets kopplingsögla?',
    answer: 'Maximalt 2 mm (från 50 mm till 48 mm, mätt med kontrolltolk).',
    keyPoints: ['Max 2 mm'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Kopplingsögla (Släp)',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Varför slits dragöglan snabbare om kopplingen inte smörjs regelbundet?',
        acceptableAnswer: 'Torr metall mot metall skapar enorm friktion, värme och nötning vid varje sväng och krängning, vilket kan få öglan att tunnas ut och spricka.',
        riskAspect: 'Sprickbildning och utmattningsbrott i dragöglan'
      }
    ]
  },
  {
    id: 14,
    category: 'Kopplingsanordning',
    question: 'Vad anger D-värdet på en kopplingsanordning?',
    answer: 'Den horisontella teoretiska drag-/tryckkraften mellan dragfordon och släpvagn med ledad dragstång.',
    keyPoints: ['Horisontell dragkraft', 'Ledad dragstång / släpvagn'],
    applicableLicenses: ['C1E', 'CE'],
    vehicleFocus: 'D-värde (Tung släpvagn)',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vad riskerar du om släpvagnens totalvikt överskrider det tillåtna D-värdet för bilens dragbalk?',
        acceptableAnswer: 'Dragbalken eller infästningen i chassit kan deformeras eller knäckas vid hård acceleration eller kraftig inbromsning.',
        riskAspect: 'Deformerat eller avbrutet chassi'
      }
    ]
  },
  {
    id: 15,
    category: 'Kopplingsanordning',
    question: 'Vad anger DC-värdet på en kopplingsanordning?',
    answer: 'Horisontell dynamisk dragkraft vid koppling till släpkärra (med stel dragstång).',
    keyPoints: ['Horisontell kraft för släpkärra (stel dragstång)'],
    applicableLicenses: ['C1E', 'CE'],
    vehicleFocus: 'DC-värde (Släpkärra)',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Varför har DC-värdet och V-värdet en direkt relation för släpkärror?',
        acceptableAnswer: 'För att en släpkärra med stel bom utsätter kopplingen för kombinerade horisontella och vertikala brytkrafter samtidigt under körning.',
        riskAspect: 'Kombinerade brytkrafter som överbelastar draget'
      }
    ]
  },
  {
    id: 16,
    category: 'Kopplingsanordning',
    question: 'Vad anger S-värdet på en koppling?',
    answer: 'Den högsta tillåtna statiska vertikala lasten (stödlasten / kultrycket) på kopplingspunkten.',
    keyPoints: ['Statisk vertikal last / stödlast', 'Mäts i kg'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Stödlast / S-värde',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vilka faror uppstår om S-värdet överskrids kraftigt genom felaktig lastplacering på kärran?',
        acceptableAnswer: 'Bakaxeln på dragbilen överbelastas, framaxeln lättar med drastiskt försämrad styrförmåga, och dragbalken kan knäckas.',
        riskAspect: 'Förlorad styrförmåga och axelöverbelastning'
      }
    ]
  },
  {
    id: 17,
    category: 'Kopplingsanordning',
    question: 'Vad anger V-värdet på en kopplingsanordning?',
    answer: 'Den dynamiska vertikala kraften under färd mellan lastbil och släpkärra med stel dragstång (anges som V-luft eller V-stål beroende på fjädring).',
    keyPoints: ['Dynamisk vertikal kraft under färd', 'V-luft vid luftfjädring, V-stål vid bladfjädring'],
    applicableLicenses: ['C1E', 'CE'],
    vehicleFocus: 'V-värde (Tung släpkärra)',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Varför tillåter samma koppling ofta högre V-värde vid luftfjädring än vid bladfjädring?',
        acceptableAnswer: 'Luftfjädring dämpar de kraftiga stötarna mjukare, medan bladfjädring ger hårda, stumma stötar som belastar kopplingen mycket mer dynamiskt.',
        riskAspect: 'Hårda dynamiska stötar orsakar snabb utmattning'
      }
    ]
  },
  {
    id: 18,
    category: 'Kopplingsanordning',
    question: 'Vad anger U-värdet på en vändskiva?',
    answer: 'Den maximala statiska vertikala last som vilar på vändskivan från semitrailern (påhängsvagnen) till dragbilen eller dollyn.',
    keyPoints: ['Statisk vertikal last på vändskiva', 'Semitrailer / dragbil / dolly'],
    applicableLicenses: ['CE'],
    vehicleFocus: 'Vändskiva / Trailer (CE)',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vad är risken om vändskivan överbelastas utöver U-värdet?',
        acceptableAnswer: 'Dragbilens drivaxel skadas, chassiramen kan bli skev och vändskivans låskäft kan nypa fast eller spricka under manövrering.',
        riskAspect: 'Chassiskada och låskäftshaveri'
      }
    ]
  },
  {
    id: 19,
    category: 'Däck & Hjul',
    question: 'Vilka är de lagstadgade minimikraven för mönsterdjup på tunga fordon (över 3,5 ton) under vinter- respektive sommarperioden?',
    answer: 'Vinterdäck: Minst 5 mm på drivande axel och framaxel (1,6 mm på släp). Sommardäck: Minst 1,6 mm (på yttre tvillingdäck får det vara mindre förutsatt att cordväven inte syns).',
    keyPoints: ['Vinter: 5 mm (driv/fram)', 'Sommar: 1,6 mm', 'Släp vinter: 1,6 mm'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Alla tunga fordon',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilka risker uppstår om mönsterdjupet på framhjulen är under 5 mm i moddigt vinterväglag?',
        acceptableAnswer: 'Däcken kan inte pressa undan modd och slask vilket leder till moddplaning och total förlust av styrförmågan.',
        riskAspect: 'Moddplaning och okontrollerbar avåkning'
      }
    ]
  },
  {
    id: 20,
    category: 'Däck & Hjul',
    question: 'Varför slår man med hammare eller klubba på däcken vid säkerhetskontroll?',
    answer: 'För att snabbt upptäcka punktering eller tryckfall genom att lyssna på klangen (ska ge samma stumma klang i alla däck på axeln).',
    keyPoints: ['Lyssna på klangen', 'Upptäcka punktering eller pyspunka'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Däckkontroll',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken om ett däck i ett tvillingmontage är helt tomt och du inte upptäcker det med klangprovet?',
        acceptableAnswer: 'Det andra däcket bär dubbel vikt, blir överhettat inom några mils körning och kan fatta eld (däckbrand) med risk att hela ekipaget brinner upp.',
        riskAspect: 'Däckbrand på grund av dubbel belastning på kvarvarande hjul'
      }
    ]
  },
  {
    id: 21,
    category: 'Däck & Hjul',
    question: 'Hur ser du att ett däck är godkänt som vinterdäck på ett tungt fordon?',
    answer: 'Det ska vara märkt med 3PMSF (alptopp/snöflinga) eller POR (Professional Off-Road).',
    keyPoints: ['Alptopp/snöflinga (3PMSF)', 'POR-märkning'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Vinterdäck märkning',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vad händer om polisen stoppar dig vid vinterväglag och däcken saknar 3PMSF/POR?',
        acceptableAnswer: 'Böter och hinder för fortsatt färd tills godkända däck monterats eller väglaget upphör att vara vinterväglag.',
        riskAspect: 'Körförbud på plats och lagbrott'
      }
    ]
  },
  {
    id: 22,
    category: 'Däck & Hjul',
    question: 'Under vilken period är det lagkrav på vinterdäck vid vinterväglag i Sverige?',
    answer: 'Mellan 1 december och 31 mars vid vinterväglag (för tunga fordon gäller krav på 5 mm mönsterdjup).',
    keyPoints: ['1 december – 31 mars', 'Vid vinterväglag'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Lagkrav vinter',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad definieras som vinterväglag av polis och Trafikverket?',
        acceptableAnswer: 'När det finns snö, is, snömodd eller frost på någon del av vägbanan eller vägrenen.',
        riskAspect: 'Ökad halkrisk och rättsligt ansvar vid incident'
      }
    ]
  },
  {
    id: 23,
    category: 'Däck & Hjul',
    question: 'Vad måste du tänka på efter att ett hjul bytts på ett tungt fordon?',
    answer: 'Att efterdra hjulmuttrarna med momentnyckel efter ca 5–10 mils körning.',
    keyPoints: ['Efterdra efter 5–10 mil', 'Momentnyckel'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Hjulbyte & Efterdragning',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken med att glömma efterdragningen?',
        acceptableAnswer: 'Rost och färg smulas sönder vid anliggningsytan, muttrarna gängar upp sig av vibrationerna och hjulet lossnar i hög fart med livsfara för mötande.',
        riskAspect: 'Tappat hjul i 80 km/h med dödsolycksrisk'
      }
    ]
  },
  {
    id: 24,
    category: 'Däck & Hjul',
    question: 'Vilka risker finns om en sten kilas fast mellan däcken i ett tvillingmontage?',
    answer: 'Stenen kan skada och skära sönder däckstommarna eller flyga iväg i hög hastighet och träffa fordon bakom.',
    keyPoints: ['Däckskada / explosion', 'Risk att den slungas mot bakomvarande trafik'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Tvillingmontage',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Hur ska du säkrast avlägsna en fastkilad sten vid säkerhetskontrollen?',
        acceptableAnswer: 'Använda spett eller bräckjärn och bända loss den försiktigt utan att skada däckcorden, eller släppa ur luft om den sitter stenhårt fast.',
        riskAspect: 'Skada på däcksida vid ovarsam hantering'
      }
    ]
  },
  {
    id: 25,
    category: 'Däck & Hjul',
    question: 'Vad händer med däcket och fordonet vid för lågt lufttryck?',
    answer: 'Däcket blir kraftigt överhettat med risk för explosion (däckbrand), däcket slits på kanterna, bränsleförbrukningen stiger och fordonet blir instabilt.',
    keyPoints: ['Överhettning / däckexplosion', 'Slitage på kanterna', 'Ökad förbrukning & instabilitet'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Däcktryck',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Varför ökar risken för vältning om framdäcken har för lågt lufttryck?',
        acceptableAnswer: 'Däcksidorna kränger kraftigt i kurvor, vilket ger fördröjd styrrespons och självsvängning som i värsta fall välter ett tungt fordon med hög tyngdpunkt.',
        riskAspect: 'Kräning och vältningsrisk vid undanmanöver'
      }
    ]
  },
  {
    id: 26,
    category: 'Däck & Hjul',
    question: 'Vad händer vid för högt lufttryck i däcket?',
    answer: 'Däcket slits i mitten av slitbanan, väggreppet försämras (mindre anliggningsyta) och risken för stöt- och explosionsskador ökar.',
    keyPoints: ['Slitage i mitten', 'Sämre väggrepp', 'Hårdare gång'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Däcktryck',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Hur påverkas fordonets bromssträcka av för högt lufttryck vid regn/halka?',
        acceptableAnswer: 'Bromssträckan förlängs markant eftersom anliggningsytan mot vägen minskar kraftigt och vatten inte dräneras optimalt.',
        riskAspect: 'Förlängd bromssträcka & halkrisk'
      }
    ]
  },
  {
    id: 27,
    category: 'Däck & Hjul',
    question: 'Hur ska dubbdäck monteras på en tung lastbil om dubbdäck används?',
    answer: 'De ska monteras axelvis och symmetriskt. Man får aldrig ha dubbat på ena sidan och odubbat på andra sidan av samma axel.',
    keyPoints: ['Axelvis och symmetriskt', 'Aldrig blanda på samma axel'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Dubbdäck',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vad är risken om du har dubbat på vänster sida och odubbat på höger sida vid en kraftig inbromsning på is?',
        acceptableAnswer: 'Bilen får kraftig sneddragning och roterar/sladdar av vägen eller in i mötande körfält pga asymmetriskt väggrepp.',
        riskAspect: 'Svår roterande sladd rakt in i mötande trafik'
      }
    ]
  },
  {
    id: 28,
    category: 'Däck & Hjul',
    question: 'Får man använda vinterdäck (friktionsdäck) under sommaren?',
    answer: 'Ja, odubbade friktionsdäck är tillåtna på sommaren, men rekommenderas inte pga längre bromssträcka och mjukare gummiblandning.',
    keyPoints: ['Tillåtet', 'Sämre bromssträcka & snabbare slitage'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Däckval',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilken är den största trafikfaran med nordiska friktionsdäck i varmt sommarväder?',
        acceptableAnswer: 'Gummiblandningen blir överhettad och mjuk som suddgummi, vilket förlänger bromssträckan med upp till 20–30 % jämfört med sommardäck.',
        riskAspect: 'Betydligt längre bromssträcka och instabil kurvtagning'
      }
    ]
  },
  {
    id: 29,
    category: 'Däck & Hjul',
    question: 'Varför finns det stänkskydd och stänkskärmar på lastbilen?',
    answer: 'För att minimera stenskott och vattendimma som försämrar sikten för bakomvarande trafikanter.',
    keyPoints: ['Minska vattendimma och stenskott'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE'],
    vehicleFocus: 'Lastbil Kaross',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad riskerar bakomvarande bilister om stänkskyddet saknas vid hällregn på motorväg?',
        acceptableAnswer: 'En ogenomtränglig vägg av vattendimma (whiteout) som gör att bakomvarande kör i blindo med extrem påkörningsrisk.',
        riskAspect: 'Noll-sikt och masskrockrisk bakom fordonet'
      }
    ]
  },
  {
    id: 30,
    category: 'Däck & Hjul',
    question: 'Vad betyder det om det rinner rostvatten eller roststrimmor från hjulbultarna/muttrarna?',
    answer: 'Det indikerar mikrorörelser – muttrarna har lossnat eller är på väg att lossna och måste dras åt omedelbart.',
    keyPoints: ['Muttrarna är lösa', 'Måste efterdras / åtgärdas'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Hjulbultar',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Får du köra vidare om du upptäcker roststrimmor vid flera muttrar?',
        acceptableAnswer: 'Nej, du måste stanna omedelbart och dra åt med föreskrivet moment. Fortsatt färd innebär akut risk för hjulhaveri.',
        riskAspect: 'Akut risk att hjulet separerar från fordonet'
      }
    ]
  },
  {
    id: 31,
    category: 'Styrning & Vätskor',
    question: 'Vilka kontroller gör du på servostyrningen innan provkörning?',
    answer: 'Kontrollera servooljenivån i behållaren. Vrid på ratten och känn att styrningen går mjukt och jämnt utan ryck eller hugg och utan missljud från servopumpen.',
    keyPoints: ['Oljenivå', 'Mjuk gång utan hugg', 'Inga missljud'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Servostyrning',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad innebär det om servostyrningen plötsligt slutar fungera i en skarp rondell?',
        acceptableAnswer: 'Ratten blir extremt tung att vrida, vilket gör att föraren inte orkar hålla kurvan och kör rakt fram över refug eller in i medtrafikanter.',
        riskAspect: 'Omedelbar styrkollaps i kurva'
      }
    ]
  },
  {
    id: 32,
    category: 'Styrning & Vätskor',
    question: 'Om ratten hugger eller går ryckigt när du svänger, vad är det troliga felet?',
    answer: 'Det är luft i hydraulsystemet, smutsigt filter eller sliten servopump/låg oljenivå.',
    keyPoints: ['Luft i servon', 'Låg oljenivå / sliten pump'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Styrning / Hydraulik',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vilka risker uppstår vid ryckig styrning under snabb manövrering?',
        acceptableAnswer: 'Föraren kan tappa kontrollen i en kritisk undanmanöver då kraften i ratten varierar okontrollerat.',
        riskAspect: 'Instabil fordonsbana och okontrollerad svängning'
      }
    ]
  },
  {
    id: 33,
    category: 'Styrning & Vätskor',
    question: 'Vad ska du tänka på vid påfyllning eller byte av servoolja?',
    answer: 'Att det är exakt rätt föreskriven oljekvalitet (ATF eller hydraulolja), rätt nivå och att det är absolut rent så ingen smuts tränger in i hydrauliken.',
    keyPoints: ['Rätt oljetyp', 'Absolut renlighet', 'Korrekt nivå'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Styrservoolja',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vad händer om smuts eller fel olja hälls i styrsystemet?',
        acceptableAnswer: 'Ventiler i styrsnäckan kärvar och pumpen skär, vilket leder till att styrningen låser sig eller förlorar all servoverkan.',
        riskAspect: 'Kärvande styrsnäcka och låsning'
      }
    ]
  },
  {
    id: 34,
    category: 'Färdskrivare',
    question: 'Vilka kontroller ska du göra på färdskrivaren under säkerhetskontrollen?',
    answer: 'Kontrollera giltigt besiktningsdatum på kontrollmärket, att klockan/tiden stämmer (UTC/lokaltid), att mätarställningen stämmer, att plomberingen är intakt samt att det finns minst 6 pappersrullar.',
    keyPoints: ['Besiktningsdatum & kontrollmärke', 'Plombering intakt', 'Tid & km-ställning', 'Reservrullar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdskrivare',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Varför är det viktigt att tidsinställningen i färdskrivaren är exakt synkroniserad?',
        acceptableAnswer: 'För att kör- och vilotider loggas mot UTC-tid; felaktig tid kan ge felaktiga överträdelser och dryga sanktionsavgifter.',
        riskAspect: 'Felaktiga kör- och vilotidsrapporter och sanktioner'
      }
    ]
  },
  {
    id: 35,
    category: 'Färdskrivare',
    question: 'Vad är den röda plomberingsknappen/sigillet på färdskrivaren till för?',
    answer: 'Det är en manipulationssäkring (plombering) som garanterar att färdskrivaren inte öppnats eller manipulerats för fusk.',
    keyPoints: ['Plombering mot fusk', 'Garanterar obruten enhet'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdskrivare',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är det rättsliga ansvaret om föraren kör med bruten plombering?',
        acceptableAnswer: 'Fordonet beläggs med körförbud, polisen kan misstänka manipulation av färdskrivare vilket är ett allvarligt brott med dryga böter.',
        riskAspect: 'Körförbud och misstanke om manipulerad färdskrivare'
      }
    ]
  },
  {
    id: 36,
    category: 'Färdskrivare',
    question: 'Får man köra lastbilen om färdskrivaren går sönder under färd?',
    answer: 'Ja, men endast under högst en vecka (7 dagar) för att ta fordonet till godkänd verkstad. Under tiden ska manuella noteringar göras på baksidan av skrivarrullen.',
    keyPoints: ['Max 7 dagar', 'Manuella noteringar på remsa'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdskrivare & Lagkrav',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vilken risk finns om föraren glömmer att göra manuella registreringar under dessa 7 dagar?',
        acceptableAnswer: 'Körtiden kan inte styrkas, vilket betraktas som körning utan färdskrivare och leder till böter samt avstängning.',
        riskAspect: 'Böter och misstänkt kör- och vilotidsbrott'
      }
    ]
  },
  {
    id: 37,
    category: 'Färdskrivare',
    question: 'Får du köra lastbilen om du glömt ditt personliga förarkort hemma?',
    answer: 'Nej! Det är absolut förbjudet att köra utan förarkort om du har ett utfärdat.',
    keyPoints: ['Nej, absolut förbjudet'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Förarkort',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilken påföljd drabbar föraren om polisen stoppar ett ekipage där föraren saknar förarkortet på plats?',
        acceptableAnswer: 'Omedelbart förbud mot fortsatt körning och böter. Ny förare med förarkort måste kallas till platsen.',
        riskAspect: 'Omedelbart stopp och stilleståndskostnader'
      }
    ]
  },
  {
    id: 38,
    category: 'Färdskrivare',
    question: 'Vad gäller om du förlorat (tappat bort eller blivit bestulen på) ditt förarkort?',
    answer: 'Du måste anmäla förlusten till polisen och Transportstyrelsen inom 7 dagar. Du får fortsätta köra i högst 15 kalenderdagar mot att du skriver ut remsor vid arbetsdagens start och slut och signerar dem manuellt.',
    keyPoints: ['Förlustanmäl inom 7 dagar', 'Max 15 kalenderdagar', 'Skriv ut och signera remsa dagligen'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Förarkort',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vad händer om de 15 kalenderdagarna har passerat och du inte fått ett ersättningskort?',
        acceptableAnswer: 'Du får under inga omständigheter köra vidare i yrkestrafik förrän det nya kortet mottagits.',
        riskAspect: 'Lagbrott att fortsätta köra utan kort efter 15 dagar'
      }
    ]
  },
  {
    id: 39,
    category: 'Färdskrivare',
    question: 'Vad innebär det om plomberingen på färdskrivaren saknas eller är bruten?',
    answer: 'Fordonet har omedelbart körförbud och får inte användas i yrkesmässig trafik.',
    keyPoints: ['Körförbud'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdskrivare',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilka konsekvenser får detta för åkeriet vid en företagskontroll?',
        acceptableAnswer: 'Åkeriet kan få sina trafiktillstånd återkallade eller prövade på grund av bristande regelefterlevnad.',
        riskAspect: 'Återkallat trafiktillstånd'
      }
    ]
  },
  {
    id: 40,
    category: 'Färdskrivare',
    question: 'Hur många dagar bakåt sparas all data på förarens digitala förarkort?',
    answer: 'Minst 56 dagar bakåt i tiden plus innevarande dag (tidigare 28 dagar, ändrades med EU-mobilitetspaketet).',
    keyPoints: ['56 dagar + innevarande dag'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Förarkort Data',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad måste du kunna visa upp för kontrollanten om du kört ett fordon med analog färdskrivare under de senaste 56 dagarna?',
        acceptableAnswer: 'Samtliga analoga diagramblad för dessa dagar samt intyg om ledighet (aktivitetsintyg).',
        riskAspect: 'Böter vid oförmåga att styrka aktiviteter 56 dagar bakåt'
      }
    ]
  },
  {
    id: 41,
    category: 'Färdskrivare',
    question: 'Hur länge måste transportföretaget/arbetsgivaren spara data som laddas ner från förarkort och färdskrivare?',
    answer: 'I minst ett år (12 månader) i kronologisk ordning.',
    keyPoints: ['Minst 1 år (12 månader)'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Åkeri & Lagkrav',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Hur ofta måste företaget tanka ur data från förarens kort respektive fordonets färdskrivare?',
        acceptableAnswer: 'Förarkortet minst var 28:e dag och färdskrivarenheten minst var 90:e dag.',
        riskAspect: 'Företagsbot vid försenad kopiering'
      }
    ]
  },
  {
    id: 42,
    category: 'Färdskrivare',
    question: 'Vilka är de fyra symbolerna (lägena) på en digital färdskrivare?',
    answer: 'Ratt = Körtid. Två hammare = Annat arbete. Fyrkant med streck = Tillgänglighet / standby. Säng = Rast och vila.',
    keyPoints: ['Ratt = Körtid', 'Hammare = Annat arbete', 'Fyrkant = Tillgänglighet', 'Säng = Rast/Vila'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdskrivare Symboler',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken med att glömma skifta från vila (säng) till annat arbete (hammare) vid lastning/lossning?',
        acceptableAnswer: 'Det räknas som fusk och felaktig registrering, vilket leder till sanktionsavgifter vid kontroll.',
        riskAspect: 'Böter för felaktig aktivitetsregistrering'
      }
    ]
  },
  {
    id: 43,
    category: 'Färdskrivare',
    question: 'Vad måste du göra när fordonet ska in på verkstad och ställs i "OUT of scope"-läge?',
    answer: 'Skriva ut en dygnsremsa innan läget aktiveras, och skriva ut en ny dygnsremsa när fordonet hämtas ut innan kortet sätts in igen.',
    keyPoints: ['Skriv ut remsa före OUT-läge', 'Skriv ut ny remsa vid hämtning'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdskrivare OUT-läge',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vilken risk finns om OUT-läget glöms kvar när du kör ut på allmän väg igen?',
        acceptableAnswer: 'Körningen registreras som undantagen körning på allmän väg vilket är ett allvarligt brott mot kör- och vilotidsförordningen.',
        riskAspect: 'Allvarligt regelbrott mot kör- och vilotider'
      }
    ]
  },
  {
    id: 44,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilka yttre respektive inre kontroller görs på bromssystemet?',
    answer: 'Yttre: Dränera lufttankar, lyssna efter nysning från lufttorken, lyssna efter pysande läckage vid matardelen. Inre: Täthetskontroll 30 sek, lågtrycksindikatorns funktion, kontroll av färdbroms och parkeringsbroms samt spärrventil.',
    keyPoints: ['Yttre: Dränering, nysning, pysläckage', 'Inre: 30 sek-test, lågtrycksvarning, spärrventil'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Bromskontroll',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Varför räcker det inte med att enbart göra den inre kontrollen vid provet?',
        acceptableAnswer: 'För att yttre fukt, oljeläckage i tankar och läckage i matarledningar bara kan upptäckas fysiskt vid tankar och kopplingar.',
        riskAspect: 'Dolda fel i tryckluftens renhet förbises'
      }
    ]
  },
  {
    id: 45,
    category: 'Bromssystem & Tryckluft',
    question: 'Beskriv tryckluftens väg genom bromssystemet från intag till hjulbroms.',
    answer: 'Luftfilter → Kompressor → Lufttork (fukt och oljeavskiljare) → Fyrkretsskyddsventil → Primär- och sekundärlufttankar → Bromsventil (pedal) / handbromsventil → Reläventiler / ABS/EBS-modulatorer → Bromscylindrar / membran.',
    keyPoints: ['Filter → Kompressor → Lufttork', 'Fyrkretsskyddsventil → Tankar', 'Bromsventil → Bromscylindrar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Tryckluftsschema',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vilken funktion fyller reläventilerna för de bakre bromsarna?',
        acceptableAnswer: 'De förkortar anläggningstiden drastiskt genom att mata luft direkt från en närbelägen tank istället för att all luft ska gå fram och tillbaka genom pedalen i hytten.',
        riskAspect: 'Fördröjd bromsrespons och längre bromssträcka utan reläventil'
      }
    ]
  },
  {
    id: 46,
    category: 'Bromssystem & Tryckluft',
    question: 'Varför dränerar man lufttankarna på ett tungt fordon?',
    answer: 'För att kontrollera att det endast kommer torr luft och att det inte samlats kondensvatten eller motorolja i systemet.',
    keyPoints: ['Säkerställa torr luft', 'Upptäcka vatten eller oljeläckage'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Lufttankar',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilka risker finns med olja i tryckluftstankarna för ventiler och gummipackningar?',
        acceptableAnswer: 'Motoroljan bryter ner gummimembran och tätningar så att de sväller och spricker, vilket orsakar massiva luftläckage och ventilhaverier.',
        riskAspect: 'Nedbrutna gummipackningar och ventilkollaps'
      }
    ]
  },
  {
    id: 47,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad innebär det om det rinner vatten ur lufttanken vid dränering?',
    answer: 'Att torkmedlet i lufttorkens filterpatron är mättat eller förbrukat och att filtret omgående måste bytas.',
    keyPoints: ['Lufttorkfilter mättat', 'Filtret måste bytas'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Lufttork & Kondens',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Hur påverkas fordonets tryckluftstankar vid minus 15 grader om vatten finns kvar?',
        acceptableAnswer: 'Vattnet fryser till is, tankens volym minskar och isproppar kan blockera bottenventilerna helt.',
        riskAspect: 'Frysta bottenventiler och sprängskador'
      }
    ]
  },
  {
    id: 48,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad innebär det om det kommer motorolja ur lufttanken vid dränering?',
    answer: 'Det tyder på att kompressorns kolvringar eller tätningar är slitna och släpper igenom olja till tryckluften.',
    keyPoints: ['Sliten kompressor', 'Olja i bromssystemet förstör packningar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Kompressor',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vad krävs för åtgärd på verkstad när olja trängt in i hela bromssystemet?',
        acceptableAnswer: 'Byte eller renovering av kompressor samt genomspolning och byte av samtliga kontaminerade ventiler och torkfilter.',
        riskAspect: 'Omfattande och dyrbar bromsrenovering'
      }
    ]
  },
  {
    id: 49,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilken fara uppstår om kondensvatten finns i tryckluftstankarna under vintern?',
    answer: 'Det kan bildas isproppar i ventilerna vilket kan leda till att bromsarna låser sig eller att bromsverkan helt uteblir.',
    keyPoints: ['Isproppar', 'Risk för totalt bromsbortfall'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Vinterdrift & Tryckluft',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad ska man göra om man drabbas av en ispropp under körning på landsväg?',
        acceptableAnswer: 'Stanna trafiksäkert, tillkalla bärgare eller tina ventilerna försiktigt med värme; aldrig fortsätta färden med osäker bromsverkan.',
        riskAspect: 'Total förlust av färdbroms'
      }
    ]
  },
  {
    id: 50,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur genomförs en utökad täthetskontroll och vad är tidsgränsen?',
    answer: 'Om 30-sekunderstestet visar tryckfall görs en 3-minuterstest. Under 3 minuter med nedtrampad broms får trycket inte sjunka mer än 0,5 bar på någon krets.',
    keyPoints: ['3 minuter', 'Färdbroms nertryckt', 'Max 0,5 bar tryckfall'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Täthetskontroll',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Varför är 3-minuterstestet mer tillförlitligt än ett snabbt test?',
        acceptableAnswer: 'För att små smygläckage i långa slangledningar eller kopplingar ackumuleras och blir mätbara över längre tid.',
        riskAspect: 'Smygläckage som annars missas'
      }
    ]
  },
  {
    id: 51,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilket lufttryck bör det minst vara i systemet innan du påbörjar täthetskontrollen?',
    answer: 'Fullt arbetstryck, normalt mellan 8 och 10 bar.',
    keyPoints: ['Fullt arbetstryck (8–10 bar)'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Arbetstryck',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Varför kan man inte utföra testet vid endast 5 bar?',
        acceptableAnswer: 'För att spärrventiler och säkerhetsventiler inte öppnat fullt och manometrarna inte speglar verkligt arbetstryck under drift.',
        riskAspect: 'Missvisande säkerhetsbedömning'
      }
    ]
  },
  {
    id: 52,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilken broms håller fast fordonet när trycket faller och lågtrycksindikatorn varnar?',
    answer: 'Parkeringsbromsen (fjäderbromsarna / spärrventilen).',
    keyPoints: ['Parkeringsbroms / fjäderbroms'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Fjäderbroms',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilken mekanisk kraft är det som faktiskt trycker till bromsbeläggen i fjäderbromsen?',
        acceptableAnswer: 'En mycket kraftig förspänd spiralfjäder som trycks ut när luften evakueras.',
        riskAspect: 'Extrem mekanisk fjäderkraft som inte kan hejdas'
      }
    ]
  },
  {
    id: 53,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad ska du göra om lågtrycksindikatorn tänds under körning på motorväg/landsväg?',
    answer: 'Stanna omedelbart på ett trafiksäkert sätt, sätt på varningsblinkers och utför felsökning / utökad täthetskontroll. Fortsatt färd är förbjuden om trycket faller.',
    keyPoints: ['Stanna omedelbart trafiksäkert', 'Felsök & tillkalla bärgare vid behov'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Nödsituationer',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Varför är det livsfarligt att försöka köra vidare till "nästa avfart" med tänd lågtrycksvarnare?',
        acceptableAnswer: 'Inom sekunder kan fjäderbromsen slå till automatiskt och tvärnita bakhjulen mitt i rusningstrafik utan att bromsljuset ens tänds via pedalen.',
        riskAspect: 'Omedelbar ofrivillig panikblockering av bakhjulen'
      }
    ]
  },
  {
    id: 54,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilka olika bromssystem finns på en modern tung lastbil?',
    answer: 'Färdbroms (fotbroms), parkeringsbroms (handbroms) och hjälpbromsar (avgasbroms och retarder).',
    keyPoints: ['Färdbroms', 'Parkeringsbroms', 'Hjälpbroms (avgasbroms & retarder)'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE'],
    vehicleFocus: 'Lastbilsbromsar',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Varför får du inte enbart lita till färdbromsen vid körning utför långa bergspassager?',
        acceptableAnswer: 'Färdbromsen överhettas snabbt (fading), bromsvätska/belägg glaserar och all bromseffekt försvinner.',
        riskAspect: 'Total bromsförlust utför backar (fading)'
      }
    ]
  },
  {
    id: 55,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilka hjul bromsas när du trycker på färdbromspedalen?',
    answer: 'Samtliga hjul på fordonet (och på tillkopplat släp).',
    keyPoints: ['Samtliga hjul'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Färdbroms',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Hur fördelas bromskraften mellan fram- och bakaxel vid tom respektive fullt lastad bil?',
        acceptableAnswer: 'Elektroniskt via EBS / lastkännande ventil så att bakaxeln får mycket mer bromskraft när lastbilen är tungt lastad.',
        riskAspect: 'Sladdrisk eller överstyrning vid felaktig lastreglering'
      }
    ]
  },
  {
    id: 56,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilka hjul bromsas normalt när parkeringsbromsen ansätts?',
    answer: 'Drivaxeln/drivaxlarna (där fjäderbromscylindrarna sitter).',
    keyPoints: ['Drivaxeln (fjäderbromscylindrar)'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Parkeringsbroms',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken om du parkerar i en extremt brant och hal backe med enbart parkeringsbromsen åtdragen?',
        acceptableAnswer: 'Eftersom endast drivaxeln är låst kan bakhjulen glida på isen och fordonet börja kana okontrollerat utför backen.',
        riskAspect: 'Ekipaget glider iväg pga låsta hjul på hal yta'
      }
    ]
  },
  {
    id: 57,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur fungerar en avgasbroms?',
    answer: 'Ett spjäll i avgasröret stängs vilket skapar mottryck för kolvarna i motorn och bromsar vevaxeln hydrauliskt/mekaniskt.',
    keyPoints: ['Spjäll i avgasröret stängs', 'Skapar mottryck i motorn'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Avgasbroms',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Varför ger avgasbromsen bäst bromsverkan vid höga motorvarvtal?',
        acceptableAnswer: 'Eftersom motorn pumpar mer luft per sekund vid högre varv vilket skapar maximalt mottryck bakom det stängda spjället.',
        riskAspect: 'Ineffektiv bromsning om fel växel väljs'
      }
    ]
  },
  {
    id: 58,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur fungerar en hydraulisk retarder?',
    answer: 'Olja pressas in mellan en roterande rotor och en fast stator vilket skapar friktion och bromskraft i drivlinan utan att bromsbeläggen slits.',
    keyPoints: ['Hydraulisk broms på kardanaxeln', 'Olja mellan rotor och stator', 'Sparar färdbroms'],
    applicableLicenses: ['C', 'CE', 'D', 'DE'],
    vehicleFocus: 'Retarder',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Var tar den enorma rörelseenergin vägen när retardern bromsar ett 40-tons ekipage?',
        acceptableAnswer: 'Den omvandlas till värme i retarderoljan som kyls ner via motorns ordinarie kylsystem.',
        riskAspect: 'Risk för motorkokning vid långvarig retarderanvändning'
      }
    ]
  },
  {
    id: 59,
    category: 'Bromssystem & Tryckluft',
    question: 'Nämn en stor fördel och en allvarlig nackdel med att använda retarder?',
    answer: 'Fördel: Sparar färdbromsens skivor och belägg mot överhettning (fading) i långa nedförsbackar. Nackdel: Vid halka på vintern kan fordonet få sladd eller fällknivseffekt eftersom retardern endast bromsar drivaxeln.',
    keyPoints: ['Fördel: Förhindrar fading / slitage', 'Nackdel: Sladdrisk vid halka (bromsar endast drivaxel)'],
    applicableLicenses: ['C', 'CE', 'D', 'DE'],
    vehicleFocus: 'Retarder & Vinterväglag',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vad ska du omedelbart göra med retardern om du känner att bakvagnen börjar släppa på vinterväglag?',
        acceptableAnswer: 'Släppa retardern direkt så att drivhjulen rullar fritt och återfår sitt sidogrepp.',
        riskAspect: 'Akut fällknivseffekt och saxning av ekipage'
      }
    ]
  },
  {
    id: 60,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad är den grundläggande skillnaden i funktion mellan färdbroms och parkeringsbroms?',
    answer: 'Färdbromsen behöver tryckluft för att BROMAS (tryck sätter an bromsen). Parkeringsbromsen har kraftiga fjädrar och behöver tryckluft för att LOSSAS.',
    keyPoints: ['Färdbroms: Behöver luft för att bromsa', 'P-broms: Behöver luft för att släppa fjädern'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Bromsfunktion',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Varför är detta konstruerat som ett "failsafe"-system?',
        acceptableAnswer: 'För att om tryckluften försvinner helt vid en katastrof ska fjädrarna automatiskt låsa fast fordonet istället för att det rullar iväg utan bromsar.',
        riskAspect: 'Inbyggt mekaniskt skydd mot skenande fordon'
      }
    ]
  },
  {
    id: 61,
    category: 'Bromssystem & Tryckluft',
    question: 'Vid vilket tryck brukar det tidigast vara möjligt att lossa parkeringsbromsen?',
    answer: 'Normalt vid ca 5,5 till 6 bar.',
    keyPoints: ['Ca 5,5 – 6 bar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Parkeringsbroms tryck',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vad riskerar du om du mekaniskt skruvar ut fjäderbromsens lossningsbultar för att bogsera och sedan glömmer att återställa dem?',
        acceptableAnswer: 'Fordonet saknar då helt fungerande mekanisk parkeringsbroms och kan inte parkeras säkert.',
        riskAspect: 'Bortkopplad parkeringsbroms och ohejdad rullning'
      }
    ]
  },
  {
    id: 62,
    category: 'Bromssystem & Tryckluft',
    question: 'Vid vilket lufttryck slår spärrventilen normalt till och låser fordonet automatiskt?',
    answer: 'När trycket i kretsen sjunker under ca 4,5–5,0 bar.',
    keyPoints: ['Under 4,5 – 5,0 bar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Spärrventil',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vad händer rent fysiskt med knappen/reglaget till spärrventilen i hytten när den löser ut?',
        acceptableAnswer: 'Knappen "poppar ut" med ett distinkt ljud och fjäderbromsen låses fast.',
        riskAspect: 'Mekanisk låsning som måste kvitteras manuellt'
      }
    ]
  },
  {
    id: 63,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilken livsviktig säkerhetsuppgift har spärrventilen?',
    answer: 'Den förhindrar att lastbilen sätts i ofrivillig rullning om föraren råkat lossa parkeringsbromsen av misstag vid lågt tryck och lämnat hytten. När kompressorn bygger tryck slår spärren till så bilen inte rullar iväg förrän föraren aktivt kvitterar den.',
    keyPoints: ['Förhindrar ofrivillig rullning', 'Kräver aktiv kvittering'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Spärrventil Säkerhet',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vad kunde hända på äldre lastbilar som saknade spärrventil vid start på morgonen?',
        acceptableAnswer: 'Om handbromsen råkat petas ur började lastbilen plötsligt rulla av sig själv så fort kompressorn pumpat upp tryck, ofta med föraren stående utanför.',
        riskAspect: 'Dödsolyckor där förare klämts av själv-rullande fordon'
      }
    ]
  },
  {
    id: 64,
    category: 'Allmän Fordonskontroll',
    question: 'Vad innebär fyrkretsskyddsventilens funktion vid ett tryckluftsbrott?',
    answer: 'Om en krets drabbas av läckage stänger fyrkretsventilen av den trasiga kretsen så att de övriga kretsarna behåller sitt tryck (normalt ca 4,5–5 bar).',
    keyPoints: ['Säkrar övriga kretsar vid läckage', 'Behåller resttryck i intakta kretsar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Fyrkretsskyddsventil',
    difficulty: 'Teknisk',
    followUpQuestions: [
      {
        question: 'Vilka är de 4 typiska kretsarna i systemet?',
        acceptableAnswer: 'Krets 1: Bakbromsar, Krets 2: Frambromsar, Krets 3: Parkeringsbroms och släpvagnsbroms, Krets 4: Extrautrustning (t.ex. luftfjädring, tuta, dörrar).',
        riskAspect: 'Skydd mot att sekundära funktioner slår ut bromsarna'
      }
    ]
  },
  {
    id: 65,
    category: 'Kopplingsanordning',
    question: 'Vilka kontroller görs på tryckluftsslangarna mellan dragbil och släpvagn (Duomatic / röd-gul ledning)?',
    answer: 'Kontrollera att slangarna är fria från sprickor och skav, att gummipackningarna är mjuka och hela, och att snabbkopplingen låser distinkt utan läckage.',
    keyPoints: ['Hela slangar utan skav', 'Gummipackningar intakta', 'Låsning distinkt'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Släpvagnskoppling (Slangar)',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad händer med släpets bromsar om den röda matarledningen slits av under körning?',
        acceptableAnswer: 'Trycket försvinner omedelbart vilket gör att relänödbromsventilen slår till och släpet tvärnitar i full panikbroms.',
        riskAspect: 'Omedelbar full panikinbromsning av släpvagnen'
      }
    ]
  },
  {
    id: 66,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera gällande lastsäkring och sidolämmar före färd?',
    answer: 'Att lämmarna är reglade och låsta, att kapell/skåpdörrar är säkrade samt att spännband och surrningar är åtdragna utan fransning eller skador.',
    keyPoints: ['Låsta lämmar & dörrar', 'Hela och åtdragna surrningar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE'],
    vehicleFocus: 'Last & Gods (Ej buss)',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken om en sidoläm inte är reglad ordentligt i en rondell?',
        acceptableAnswer: 'Lämen kan slå upp och krossa cyklister eller fotgängare, alternativt välta ut godset över vägbanan.',
        riskAspect: 'Dödlig påkörning av oskyddade trafikanter med utskjutande läm'
      }
    ]
  },
  {
    id: 67,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera gällande fordonets underkörningsskydd?',
    answer: 'Att bakre och sidomonterade underkörningsskydd är oskadade, korrekt fastbultade och inte deformerade eller för högt placerade från marken.',
    keyPoints: ['Oskadat & ordentligt fäst', 'Rätt höjd från marken'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE'],
    vehicleFocus: 'Lastbil Kaross (Ej buss)',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad händer vid en påkörningsolycka bakifrån om underkörningsskyddet saknas eller viker sig?',
        acceptableAnswer: 'Personbilen glider in under lastbilens flak och bilens kupétak skalas av med omedelbar dödlig utgång för passagerarna.',
        riskAspect: 'Giljotinerad personbilskupé och dödsfall'
      }
    ]
  },
  {
    id: 68,
    category: 'Allmän Fordonskontroll',
    question: 'Vilken personlig skyddsutrustning ska alltid finnas med i fordonet?',
    answer: 'Varselväst (reflextyp), varningstriangel, skyddsskor, handskar och vid ADR/farligt gods relevant skyddsmask och ögonskölj.',
    keyPoints: ['Varselväst', 'Varningstriangel', 'Skyddsskor & handskar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Utrustning',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilken är den vanligaste dödsorsaken för yrkeschaufförer vid motorvägsstopp i mörker?',
        acceptableAnswer: 'Att de kliver ut på vägbanan utan godkänd reflexväst och blir påkörda av passerande trafik i hög hastighet.',
        riskAspect: 'Påkörningsolycka vid vistelse utanför fordonet'
      }
    ]
  },
  {
    id: 69,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur kontrollerar du att fordonets lågtrycksindikator fungerar?',
    answer: 'Trampa upprepade gånger på bromspedalen med motorn avstängd tills trycket sjunker. Indikatorn (summer och röd varningslampa) ska lösa ut vid ca 5,5–6 bar.',
    keyPoints: ['Pumpa pedalen med motor avstängd', 'Summer/lampa ska aktiveras vid 5,5–6 bar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Lågtrycksindikator',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken med att köra med trasig ljudsummer på lågtrycksindikatorn?',
        acceptableAnswer: 'Föraren har blicken på vägen och märker inte att trycket fallit förrän bromsarna antingen inte tar eller fjäderbromsen plötsligt låser sig.',
        riskAspect: 'Missad förvarning före katastrofal bromsblockering'
      }
    ]
  },
  {
    id: 70,
    category: 'Styrning & Vätskor',
    question: 'Vilka vätskor ska kontrolleras under motorhuven / frontluckan?',
    answer: 'Motorolja, kylarvätska (expansionskärl), spolarvätska, styrservoolja och eventuell kopplings-/bromsvätska.',
    keyPoints: ['Motorolja', 'Kylarvätska', 'Spolarvätska', 'Styrservoolja'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Motor & Vätskor',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken med att öppna expansionskärlet till kylarvätskan när motorn är varmkörd?',
        acceptableAnswer: 'Systemet är trycksatt och kokhet kylarvätska och ånga sprutar rakt ut med risk för svåra brännskador i ansikte och på händer.',
        riskAspect: 'Svåra brännskador från het ånga och kylarvätska'
      }
    ]
  },
  {
    id: 71,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera gällande fordonets belysning och reflexer?',
    answer: 'Halvljus, helljus, positionsljus, blinkers, dimljus, backljus, bromsljus, skyltlykta, sidomarkeringslyktor samt rena och hela reflexer (orange på sidor, röd bak).',
    keyPoints: ['Alla lyktor fungerar', 'Bromsljus & blinkers', 'Rätt färg på reflexer'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Belysning & Reflexer',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad riskerar ett 24-meters ekipage om sidomarkeringslyktorna är smutsiga eller trasiga i höstdimma?',
        acceptableAnswer: 'Korsande eller anslutande bilar ser inte det långa ekipaget i mörkret och kör rakt in i sidan på trailern.',
        riskAspect: 'Sidokollision på grund av osynlig trailer i mörker'
      }
    ]
  },
  {
    id: 72,
    category: 'Allmän Fordonskontroll',
    question: 'Vad innebär begreppet "fading" på en tung lastbils bromsar?',
    answer: 'Att bromsbelägg och trummor/skivor överhettas vid långvarig inbromsning så att friktionen dramatiskt minskar eller upphör helt och bromspedalen sjunker.',
    keyPoints: ['Överhettning av bromsar', 'Friktionen försvinner', 'Förhindras med hjälpbromsar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Bromsverkan & Säkerhet',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Hur kan du som förare helt undvika fading vid körning i långa branta nerförslut?',
        acceptableAnswer: 'Välja en tillräckligt låg grundväxel så att motorn bromsar, och aktivera retarder/avgasbroms så att färdbromsen hålls kall och reserverad för nödstopp.',
        riskAspect: 'Full bromskapacitet bibehålls för oväntade hinder'
      }
    ]
  },
  {
    id: 73,
    category: 'Kopplingsanordning',
    question: 'Vilken funktion har katastrofbromsvajern på ett släp med påskjutsbroms respektive tryckluftsspärren på tungt släp?',
    answer: 'Om släpet oavsiktligt lossnar drar vajern åt släpets handbroms, respektive sliter av matarledningen så släpets bromsar tvärnitar automatiskt.',
    keyPoints: ['Tvångsbromsar släpet vid lossning', 'Automatisk nödbroms'],
    applicableLicenses: ['C1E', 'CE', 'D1E', 'DE'],
    vehicleFocus: 'Släpvagn Katastrofbroms',
    difficulty: 'Fördjupning',
    followUpQuestions: [
      {
        question: 'Vad händer om katastrofvajern är feldragen eller för lång så den släpar i backen?',
        acceptableAnswer: 'Den kan slitas av i förtid eller inte lösas ut om släpet hoppar av kulan, vilket lämnar släpet helt herrelöst på vägen.',
        riskAspect: 'Ett 3-tons släp skenar herrelöst utan bromsverkan'
      }
    ]
  },
  {
    id: 74,
    category: 'Allmän Fordonskontroll',
    question: 'Hur kontrollerar du att ABS/EBS-lampan fungerar på fordon och släp?',
    answer: 'Slå på tändningen. Varningslamporna ska tändas för självtest och sedan slockna efter några sekunder eller när fordonet rullat upp i ca 5–7 km/h.',
    keyPoints: ['Tänds vid självtest', 'Slocknar efter start/rullning'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'ABS / EBS Elektronik',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad innebär det för ekipagets stabilitet om ABS/EBS-lampan på släpet lyser med fast sken under körning?',
        acceptableAnswer: 'Släpet saknar låsningsfritt system. Vid en hård panikinbromsning låser sig släpets hjul omedelbart vilket leder till att släpet fäller ihop sig som en fällkniv eller välter.',
        riskAspect: 'Okontrollerad fällknivseffekt vid panikbromsning'
      }
    ]
  },
  {
    id: 75,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera på vindrutan och siktfältet?',
    answer: 'Inga stenskott eller sprickor i förarens siktfält, att rutan är ren samt att torkarblad är mjuka och spolare fungerar effektivt.',
    keyPoints: ['Inga sprickor i siktfält', 'Torkarblad mjuka & rena', 'Spolarfunktion'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Sikt & Rutor',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Varför är en smutsig och repig vindruta särskilt farlig vid lågt stående höstsol?',
        acceptableAnswer: 'Ljusbrytningen i reporna skapar total bländning (mjölkglas-effekt) där gångtrafikanter framför fordonet blir fullständigt osynliga.',
        riskAspect: 'Total bländning och överkörningsrisk vid låg sol'
      }
    ]
  },
  {
    id: 76,
    category: 'Allmän Fordonskontroll',
    question: 'Vilka handlingar / dokument ska medföras i lastbilen under färd?',
    answer: 'Registreringsbevis (del 1) för lastbil och eventuellt släp, eventuellt trafiktillstånd, fraktsedlar (CMR/CMR-not), instruktionsbok och vid ADR giltigt ADR-intyg.',
    keyPoints: ['Registreringsbevis del 1', 'Trafiktillstånd', 'Fraktsedlar'],
    applicableLicenses: ['C1', 'C', 'C1E', 'CE'],
    vehicleFocus: 'Gods & Transportdokument (Lastbil)',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken med att transportera farligt gods utan medföljande transportdokument och skriftliga instruktioner?',
        acceptableAnswer: 'Vid en olycka kan räddningstjänsten inte identifiera kemikalierna, vilket leder till felaktig släckinsats och giftgasförgiftning av allmänheten.',
        riskAspect: 'Katastrofal felinsats av räddningstjänst vid olycka'
      }
    ]
  },
  // Buss specifika frågor (D / D1 / D1E / DE)
  {
    id: 77,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera gällande bussens nödutgångar och krosshammare?',
    answer: 'Att alla nödutgångar (nödöppnare vid dörrar, takluckor, nödutrymningsfönster) är fria från hinder, uppmärkta med självlysande dekaler och att föreskrivet antal krosshammare finns på plats.',
    keyPoints: ['Nödöppnare funktionstestas', 'Krosshammare på plats', 'Skyltning & fri passage'],
    applicableLicenses: ['D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Buss & Passagerarsäkerhet',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vilka livshotande risker uppstår vid en brand om nödhammare saknas eller nödutgångar är blockerade av bagage?',
        acceptableAnswer: 'Passagerarna blir instängda i en rökfylld buss och kan drabbas av dödlig rökförgiftning på under två minuter.',
        riskAspect: 'Dödlig rökförgiftning och panik vid instängdhet'
      }
    ]
  },
  {
    id: 78,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera gällande bussens brandsläckare och första hjälpen-utrustning?',
    answer: 'Brandsläckaren ska vara godkänd (minst 6 kg pulversläckare), tryckmätaren i grönt fält, plomberad samt kontrollerad inom senaste 12 månaderna. Första hjälpen-kudde ska vara komplett och lättåtkomlig.',
    keyPoints: ['Brandsläckare i grönt läge', 'Senaste 12 mån besiktigad', 'Första hjälpen komplett'],
    applicableLicenses: ['D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Buss & Brandskydd',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Varför är motorrumsbränder särskilt farliga i en turistbuss med bakmonterad motor?',
        acceptableAnswer: 'Föraren ser inte branden omedelbart, brandgaser kan sugas in i kupén och elden kan sprida sig innan bussen hunnit evakueras.',
        riskAspect: 'Explosionsartad brandspridning från motorrummet'
      }
    ]
  },
  {
    id: 79,
    category: 'Allmän Fordonskontroll',
    question: 'Hur kontrollerar du klämskyddet och automatiken på bussens passagerardörrar?',
    answer: 'Starta stängning och håll emot försiktigt med armen eller föremål. Dörren ska omedelbart vända tillbaka och öppnas automatiskt utan att klämma fast någon.',
    keyPoints: ['Håll emot dörren mjukt', 'Dörren ska reversera omedelbart', 'Akustisk varning vid stängning'],
    applicableLicenses: ['D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Bussdörrar & Klämskydd',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad är risken om dörrautomatiken inte reverserar när ett barn eller en äldre person kliver på?',
        acceptableAnswer: 'Personen kläms fast i dörrbladen och kan släpas med utanför bussen när föraren kör iväg från hållplatsen.',
        riskAspect: 'Fastklämning och dödlig medsläpning från hållplats'
      }
    ]
  },
  {
    id: 80,
    category: 'Allmän Fordonskontroll',
    question: 'Vilka regler gäller för passagerarnas säkerhetsbälten i en buss?',
    answer: 'Samtliga sittplatser utrustade med bälte ska ha fungerande rullbälten. Föraren ansvarar för att informera passagerarna (via utrop, skylt eller video) att bälte är lagstadgat under färd.',
    keyPoints: ['Hela rullbälten & lås', 'Informationsplikt till resenärer', 'Lagkrav för sittande'],
    applicableLicenses: ['D1', 'D', 'D1E', 'DE'],
    vehicleFocus: 'Buss & Bältesplikt',
    difficulty: 'Bas',
    followUpQuestions: [
      {
        question: 'Vad händer vid en bussvältning om passagerarna inte använder säkerhetsbältet?',
        acceptableAnswer: 'Passagerarna slungas runt i kupén, krossas mot tak och säten eller kastas ut genom fönsterrutorna och hamnar under bussen.',
        riskAspect: 'Extrema masskador och dödsfall vid vältolycka'
      }
    ]
  }
];

export function getQuestionsForLicense(licenseType: string): HeavySafetyQuestion[] {
  const norm = licenseType.trim().toUpperCase() as HeavyLicenseCode;
  return HEAVY_SAFETY_QUESTIONS_76.filter(q => {
    if (!q.applicableLicenses || q.applicableLicenses.length === 0) return true;
    return q.applicableLicenses.includes(norm);
  });
}
