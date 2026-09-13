export interface HeavySafetyQuestion {
  id: number;
  category: 'Däck & Hjul' | 'Bromssystem & Tryckluft' | 'Färdskrivare' | 'Kopplingsanordning' | 'Styrning & Vätskor' | 'Allmän Fordonskontroll';
  question: string;
  answer: string;
  keyPoints?: string[];
}

export const HEAVY_SAFETY_QUESTIONS_76: HeavySafetyQuestion[] = [
  {
    id: 1,
    category: 'Däck & Hjul',
    question: 'Vad ska du kontrollera på däcken vid säkerhetskontroll?',
    answer: 'Att det inte fastnat något mellan däcken i tvillingmontage. Kontrollera lufttryck, mönsterdjup, skador eller sprickor, däcktyp, att fälgen ser bra ut, ingen rost runt muttrarna, att alla muttrar sitter fast och att stänkskydden sitter fast.',
    keyPoints: ['Inget mellan tvillingdäck', 'Mönsterdjup & lufttryck', 'Inga skador/sprickor', 'Hjulmuttrar & ingen rost', 'Stänkskydd fast']
  },
  {
    id: 2,
    category: 'Bromssystem & Tryckluft',
    question: 'När du genomför en täthetskontroll upptäcker du att läckaget är för stort, vilket innebär körförbud. Hur kan du häva detta körförbud för att ta dig till verkstad?',
    answer: 'Starta motorn med foten på färdbromsen och parkeringsbromsen lossad. Om kompressorn lyckas bygga upp och hålla fullt arbetstryck på tomgång kan du köra till närmaste verkstad.',
    keyPoints: ['Starta motor på tomgång', 'Färdbroms nertryckt + P-broms lossad', 'Måste bygga upp fullt arbetstryck', 'Endast till närmaste verkstad']
  },
  {
    id: 3,
    category: 'Färdskrivare',
    question: 'Hur många pappersrullar ska du ha med i reserv vid färd med digital färdskrivare?',
    answer: 'Minst 6 pappersrullar (så du kan skriva ut de senaste 56 dagarna samt innevarande dag och eventuella kontroller).',
    keyPoints: ['Minst 6 pappersrullar', 'Täcker 56 dagar bakåt + idag']
  },
  {
    id: 4,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur kan du kontrollera att lufttorken fungerar?',
    answer: 'Lyssna efter "nysningen" (avlastningen) när kompressorn når fullt arbetstryck i botten på torken.',
    keyPoints: ['Lyssna efter nysning', 'Sker vid fullt arbetstryck', 'Avlastningsventil öppnar']
  },
  {
    id: 5,
    category: 'Färdskrivare',
    question: 'Hur ofta ska din färdskrivare besiktigas och var hittar du information om när den senast besiktigades?',
    answer: 'Var 24:e månad (vartannat år) på ackrediterad verkstad. Kontrollmärket sitter fäst i lastbilens B-stolpe på förarsidan (eller på utskriftsremsan).',
    keyPoints: ['Var 24:e månad (vartannat år)', 'Ackrediterad verkstad', 'Kontrollmärke på B-stolpe']
  },
  {
    id: 6,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad innebär det för dig om nysningen i lufttorken uteblir?',
    answer: 'Det innebär att avlastningsventilen i botten är igensatt eller trasig. Fukt och kondens hamnar då i bromssystemet vilket kan orsaka frysning på vintern (med risk för totalt bromsbortfall) eller skada ventiler och gummipackningar. Innebär körförbud tills det åtgärdats.',
    keyPoints: ['Igensatt bottenventil', 'Vatten i bromssystemet', 'Frysrisk & förstörda ventiler', 'Körförbud']
  },
  {
    id: 7,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur genomför du ett 30-sekunderstest på bromssystemet?',
    answer: 'Se till att trycket är över 6 bar. Stäng av motorn, öppna fönster/dörr, trampa ner färdbromsen och lossa parkeringsbromsen. Under 30 sekunder får manometrarna inte tappa tryck (max 0,5 bar tillåtet) och inget pysande läckage får höras utanför.',
    keyPoints: ['Minst 6 bar', 'Motor avstängd, fönster öppet', 'Färdbroms nertryckt, P-broms lossad', 'Max 0,5 bar tryckfall på 30 sek', 'Inget hörbart läckage']
  },
  {
    id: 8,
    category: 'Kopplingsanordning',
    question: 'Vad använder du för att mäta slitage på en bygelkoppling / kopplingsanordning?',
    answer: 'En kontrolltolk (slitagetolk).',
    keyPoints: ['Kontrolltolk']
  },
  {
    id: 9,
    category: 'Kopplingsanordning',
    question: 'Vilka två huvudtyper av bygelkopplingar finns det?',
    answer: 'Lagrad koppling och Olagrad koppling (kärrsäker).',
    keyPoints: ['Lagrad', 'Olagrad (kärrsäker)']
  },
  {
    id: 10,
    category: 'Kopplingsanordning',
    question: 'Vad menas med en kärrsäker koppling (olagrad koppling)?',
    answer: 'Den kan ta upp nedåtgående och vertikala krafter från släpkärra med stel dragstång (samt släpvagn).',
    keyPoints: ['Klarar vertikala / nedåtgående krafter', 'För släpkärra med stel dragstång']
  },
  {
    id: 11,
    category: 'Kopplingsanordning',
    question: 'Hur stort får det vertikala glappet vara i bygelkopplingen?',
    answer: 'Maximalt 5 mm.',
    keyPoints: ['Max 5 mm']
  },
  {
    id: 12,
    category: 'Kopplingsanordning',
    question: 'Hur stort får slitaget maximalt vara på kopplingsbulten?',
    answer: 'Maximalt 2 mm slitage från ursprungsmåttet (exempelvis från 57 mm till 55 mm eller 50 mm till 48 mm beroende på bulttyp).',
    keyPoints: ['Max 2 mm']
  },
  {
    id: 13,
    category: 'Kopplingsanordning',
    question: 'Hur stort får slitaget maximalt vara på släpets kopplingsögla?',
    answer: 'Maximalt 2 mm (från 50 mm till 48 mm, mätt med kontrolltolk).',
    keyPoints: ['Max 2 mm']
  },
  {
    id: 14,
    category: 'Kopplingsanordning',
    question: 'Vad anger D-värdet på en kopplingsanordning?',
    answer: 'Den horisontella teoretiska drag-/tryckkraften mellan dragfordon och släpvagn med ledad dragstång.',
    keyPoints: ['Horisontell dragkraft', 'Ledad dragstång / släpvagn']
  },
  {
    id: 15,
    category: 'Kopplingsanordning',
    question: 'Vad anger DC-värdet på en kopplingsanordning?',
    answer: 'Horisontell dynamisk dragkraft vid koppling till släpkärra (med stel dragstång).',
    keyPoints: ['Horisontell kraft för släpkärra (stel dragstång)']
  },
  {
    id: 16,
    category: 'Kopplingsanordning',
    question: 'Vad anger S-värdet på en koppling?',
    answer: 'Den högsta tillåtna statiska vertikala lasten (stödlasten / kultrycket) på kopplingspunkten.',
    keyPoints: ['Statisk vertikal last / stödlast', 'Mäts i kg']
  },
  {
    id: 17,
    category: 'Kopplingsanordning',
    question: 'Vad anger V-värdet på en kopplingsanordning?',
    answer: 'Den dynamiska vertikala kraften under färd mellan lastbil och släpkärra med stel dragstång (anges som V-luft eller V-stål beroende på fjädring).',
    keyPoints: ['Dynamisk vertikal kraft under färd', 'V-luft vid luftfjädring, V-stål vid bladfjädring']
  },
  {
    id: 18,
    category: 'Kopplingsanordning',
    question: 'Vad anger U-värdet på en vändskiva?',
    answer: 'Den maximala statiska vertikala last som vilar på vändskivan från semitrailern (påhängsvagnen) till dragbilen eller dollyn.',
    keyPoints: ['Statisk vertikal last på vändskiva', 'Semitrailer / dragbil / dolly']
  },
  {
    id: 19,
    category: 'Däck & Hjul',
    question: 'Vilka är de lagstadgade minimikraven för mönsterdjup på tunga fordon (över 3,5 ton) under vinter- respektive sommarperioden?',
    answer: 'Vinterdäck: Minst 5 mm på drivande axel och framaxel (1,6 mm på släp). Sommardäck: Minst 1,6 mm (på yttre tvillingdäck får det vara mindre förutsatt att cordväven inte syns).',
    keyPoints: ['Vinter: 5 mm (driv/fram)', 'Sommar: 1,6 mm', 'Släp vinter: 1,6 mm']
  },
  {
    id: 20,
    category: 'Däck & Hjul',
    question: 'Varför slår man med hammare eller klubba på däcken vid säkerhetskontroll?',
    answer: 'För att snabbt upptäcka punktering eller tryckfall genom att lyssna på klangen (ska ge samma stumma klang i alla däck på axeln).',
    keyPoints: ['Lyssna på klangen', 'Upptäcka punktering eller pyspunka']
  },
  {
    id: 21,
    category: 'Däck & Hjul',
    question: 'Hur ser du att ett däck är godkänt som vinterdäck på ett tungt fordon?',
    answer: 'Det ska vara märkt med 3PMSF (alptopp/snöflinga) eller POR (Professional Off-Road).',
    keyPoints: ['Alptopp/snöflinga (3PMSF)', 'POR-märkning']
  },
  {
    id: 22,
    category: 'Däck & Hjul',
    question: 'Under vilken period är det lagkrav på vinterdäck vid vinterväglag i Sverige?',
    answer: 'Mellan 1 december och 31 mars vid vinterväglag (för tunga fordon gäller krav på 5 mm mönsterdjup).',
    keyPoints: ['1 december – 31 mars', 'Vid vinterväglag']
  },
  {
    id: 23,
    category: 'Däck & Hjul',
    question: 'Vad måste du tänka på efter att ett hjul bytts på ett tungt fordon?',
    answer: 'Att efterdra hjulmuttrarna med momentnyckel efter ca 5–10 mils körning.',
    keyPoints: ['Efterdra efter 5–10 mil', 'Momentnyckel']
  },
  {
    id: 24,
    category: 'Däck & Hjul',
    question: 'Vilka risker finns om en sten kilas fast mellan däcken i ett tvillingmontage?',
    answer: 'Stenen kan skada och skära sönder däckstommarna eller flyga iväg i hög hastighet och träffa fordon bakom.',
    keyPoints: ['Däckskada / explosion', 'Risk att den slungas mot bakomvarande trafik']
  },
  {
    id: 25,
    category: 'Däck & Hjul',
    question: 'Vad händer med däcket och fordonet vid för lågt lufttryck?',
    answer: 'Däcket blir kraftigt överhettat med risk för explosion (däckbrand), däcket slits på kanterna, bränsleförbrukningen stiger och fordonet blir instabilt.',
    keyPoints: ['Överhettning / däckexplosion', 'Slitage på kanterna', 'Ökad förbrukning & instabilitet']
  },
  {
    id: 26,
    category: 'Däck & Hjul',
    question: 'Vad händer vid för högt lufttryck i däcket?',
    answer: 'Däcket slits i mitten av slitbanan, väggreppet försämras (mindre anliggningsyta) och risken för stöt- och explosionsskador ökar.',
    keyPoints: ['Slitage i mitten', 'Sämre väggrepp', 'Hårdare gång']
  },
  {
    id: 27,
    category: 'Däck & Hjul',
    question: 'Hur ska dubbdäck monteras på en tung lastbil om dubbdäck används?',
    answer: 'De ska monteras axelvis och symmetriskt. Man får aldrig ha dubbat på ena sidan och odubbat på andra sidan av samma axel.',
    keyPoints: ['Axelvis och symmetriskt', 'Aldrig blanda på samma axel']
  },
  {
    id: 28,
    category: 'Däck & Hjul',
    question: 'Får man använda vinterdäck (friktionsdäck) under sommaren?',
    answer: 'Ja, odubbade friktionsdäck är tillåtna på sommaren, men rekommenderas inte pga längre bromssträcka och mjukare gummiblandning.',
    keyPoints: ['Tillåtet', 'Sämre bromssträcka & snabbare slitage']
  },
  {
    id: 29,
    category: 'Däck & Hjul',
    question: 'Varför finns det stänkskydd och stänkskärmar på lastbilen?',
    answer: 'För att minimera stenskott och vattendimma som försämrar sikten för bakomvarande trafikanter.',
    keyPoints: ['Minska vattendimma och stenskott']
  },
  {
    id: 30,
    category: 'Däck & Hjul',
    question: 'Vad betyder det om det rinner rostvatten eller roststrimmor från hjulbultarna/muttrarna?',
    answer: 'Det indikerar mikrorörelser – muttrarna har lossnat eller är på väg att lossna och måste dras åt omedelbart.',
    keyPoints: ['Muttrarna är lösa', 'Måste efterdras / åtgärdas']
  },
  {
    id: 31,
    category: 'Styrning & Vätskor',
    question: 'Vilka kontroller gör du på servostyrningen innan provkörning?',
    answer: 'Kontrollera servooljenivån i behållaren. Vrid på ratten och känn att styrningen går mjukt och jämnt utan ryck eller hugg och utan missljud från servopumpen.',
    keyPoints: ['Oljenivå', 'Mjuk gång utan hugg', 'Inga missljud']
  },
  {
    id: 32,
    category: 'Styrning & Vätskor',
    question: 'Om ratten hugger eller går ryckigt när du svänger, vad är det troliga felet?',
    answer: 'Det är luft i hydraulsystemet, smutsigt filter eller sliten servopump/låg oljenivå.',
    keyPoints: ['Luft i servon', 'Låg oljenivå / sliten pump']
  },
  {
    id: 33,
    category: 'Styrning & Vätskor',
    question: 'Vad ska du tänka på vid påfyllning eller byte av servoolja?',
    answer: 'Att det är exakt rätt föreskriven oljekvalitet (ATF eller hydraulolja), rätt nivå och att det är absolut rent så ingen smuts tränger in i hydrauliken.',
    keyPoints: ['Rätt oljetyp', 'Absolut renlighet', 'Korrekt nivå']
  },
  {
    id: 34,
    category: 'Färdskrivare',
    question: 'Vilka kontroller ska du göra på färdskrivaren under säkerhetskontrollen?',
    answer: 'Kontrollera giltigt besiktningsdatum på kontrollmärket, att klockan/tiden stämmer (UTC/lokaltid), att mätarställningen stämmer, att plomberingen är intakt samt att det finns minst 6 pappersrullar.',
    keyPoints: ['Besiktningsdatum & kontrollmärke', 'Plombering intakt', 'Tid & km-ställning', 'Reservrullar']
  },
  {
    id: 35,
    category: 'Färdskrivare',
    question: 'Vad är den röda plomberingsknappen/sigillet på färdskrivaren till för?',
    answer: 'Det är en manipulationssäkring (plombering) som garanterar att färdskrivaren inte öppnats eller manipulerats för fusk.',
    keyPoints: ['Plombering mot fusk', 'Garanterar obruten enhet']
  },
  {
    id: 36,
    category: 'Färdskrivare',
    question: 'Får man köra lastbilen om färdskrivaren går sönder under färd?',
    answer: 'Ja, men endast under högst en vecka (7 dagar) för att ta fordonet till godkänd verkstad. Under tiden ska manuella noteringar göras på baksidan av skrivarrullen.',
    keyPoints: ['Max 7 dagar', 'Manuella noteringar på remsa']
  },
  {
    id: 37,
    category: 'Färdskrivare',
    question: 'Får du köra lastbilen om du glömt ditt personliga förarkort hemma?',
    answer: 'Nej! Det är absolut förbjudet att köra utan förarkort om du har ett utfärdat.',
    keyPoints: ['Nej, absolut förbjudet']
  },
  {
    id: 38,
    category: 'Färdskrivare',
    question: 'Vad gäller om du förlorat (tappat bort eller blivit bestulen på) ditt förarkort?',
    answer: 'Du måste anmäla förlusten till polisen och Transportstyrelsen inom 7 dagar. Du får fortsätta köra i högst 15 kalenderdagar mot att du skriver ut remsor vid arbetsdagens start och slut och signerar dem manuellt.',
    keyPoints: ['Förlustanmäl inom 7 dagar', 'Max 15 kalenderdagar', 'Skriv ut och signera remsa dagligen']
  },
  {
    id: 39,
    category: 'Färdskrivare',
    question: 'Vad innebär det om plomberingen på färdskrivaren saknas eller är bruten?',
    answer: 'Fordonet har omedelbart körförbud och får inte användas i yrkesmässig trafik.',
    keyPoints: ['Körförbud']
  },
  {
    id: 40,
    category: 'Färdskrivare',
    question: 'Hur många dagar bakåt sparas all data på förarens digitala förarkort?',
    answer: 'Minst 56 dagar bakåt i tiden plus innevarande dag (tidigare 28 dagar, ändrades med EU-mobilitetspaketet).',
    keyPoints: ['56 dagar + innevarande dag']
  },
  {
    id: 41,
    category: 'Färdskrivare',
    question: 'Hur länge måste transportföretaget/arbetsgivaren spara data som laddas ner från förarkort och färdskrivare?',
    answer: 'I minst ett år (12 månader) i kronologisk ordning.',
    keyPoints: ['Minst 1 år (12 månader)']
  },
  {
    id: 42,
    category: 'Färdskrivare',
    question: 'Vilka är de fyra symbolerna (lägena) på en digital färdskrivare?',
    answer: 'Ratt = Körtid. Två hammare = Annat arbete. Fyrkant med streck = Tillgänglighet / standby. Säng = Rast och vila.',
    keyPoints: ['Ratt = Körtid', 'Hammare = Annat arbete', 'Fyrkant = Tillgänglighet', 'Säng = Rast/Vila']
  },
  {
    id: 43,
    category: 'Färdskrivare',
    question: 'Vad måste du göra när fordonet ska in på verkstad och ställs i "OUT of scope"-läge?',
    answer: 'Skriva ut en dygnsremsa innan läget aktiveras, och skriva ut en ny dygnsremsa när fordonet hämtas ut innan kortet sätts in igen.',
    keyPoints: ['Skriv ut remsa före OUT-läge', 'Skriv ut ny remsa vid hämtning']
  },
  {
    id: 44,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilka yttre respektive inre kontroller görs på bromssystemet?',
    answer: 'Yttre: Dränera lufttankar, lyssna efter nysning från lufttorken, lyssna efter pysande läckage vid matardelen. Inre: Täthetskontroll 30 sek, lågtrycksindikatorns funktion, kontroll av färdbroms och parkeringsbroms samt spärrventil.',
    keyPoints: ['Yttre: Dränering, nysning, pysläckage', 'Inre: 30 sek-test, lågtrycksvarning, spärrventil']
  },
  {
    id: 45,
    category: 'Bromssystem & Tryckluft',
    question: 'Beskriv tryckluftens väg genom bromssystemet från intag till hjulbroms.',
    answer: 'Luftfilter → Kompressor → Lufttork (fukt och oljeavskiljare) → Fyrkretsskyddsventil → Primär- och sekundärlufttankar → Bromsventil (pedal) / handbromsventil → Reläventiler / ABS/EBS-modulatorer → Bromscylindrar / membran.',
    keyPoints: ['Filter → Kompressor → Lufttork', 'Fyrkretsskyddsventil → Tankar', 'Bromsventil → Bromscylindrar']
  },
  {
    id: 46,
    category: 'Bromssystem & Tryckluft',
    question: 'Varför dränerar man lufttankarna på ett tungt fordon?',
    answer: 'För att kontrollera att det endast kommer torr luft och att det inte samlats kondensvatten eller motorolja i systemet.',
    keyPoints: ['Säkerställa torr luft', 'Upptäcka vatten eller oljeläckage']
  },
  {
    id: 47,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad innebär det om det rinner vatten ur lufttanken vid dränering?',
    answer: 'Att torkmedlet i lufttorkens filterpatron är mättat eller förbrukat och att filtret omgående måste bytas.',
    keyPoints: ['Lufttorkfilter mättat', 'Filtret måste bytas']
  },
  {
    id: 48,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad innebär det om det kommer motorolja ur lufttanken vid dränering?',
    answer: 'Det tyder på att kompressorns kolvringar eller tätningar är slitna och släpper igenom olja till tryckluften.',
    keyPoints: ['Sliten kompressor', 'Olja i bromssystemet förstör packningar']
  },
  {
    id: 49,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilken fara uppstår om kondensvatten finns i tryckluftstankarna under vintern?',
    answer: 'Det kan bildas isproppar i ventilerna vilket kan leda till att bromsarna låser sig eller att bromsverkan helt uteblir.',
    keyPoints: ['Isproppar', 'Risk för totalt bromsbortfall']
  },
  {
    id: 50,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur genomförs en utökad täthetskontroll och vad är tidsgränsen?',
    answer: 'Om 30-sekunderstestet visar tryckfall görs en 3-minuterstest. Under 3 minuter med nedtrampad broms får trycket inte sjunka mer än 0,5 bar på någon krets.',
    keyPoints: ['3 minuter', 'Färdbroms nertryckt', 'Max 0,5 bar tryckfall']
  },
  {
    id: 51,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilket lufttryck bör det minst vara i systemet innan du påbörjar täthetskontrollen?',
    answer: 'Fullt arbetstryck, normalt mellan 8 och 10 bar.',
    keyPoints: ['Fullt arbetstryck (8–10 bar)']
  },
  {
    id: 52,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilken broms håller fast fordonet när trycket faller och lågtrycksindikatorn varnar?',
    answer: 'Parkeringsbromsen (fjäderbromsarna / spärrventilen).',
    keyPoints: ['Parkeringsbroms / fjäderbroms']
  },
  {
    id: 53,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad ska du göra om lågtrycksindikatorn tänds under körning på motorväg/landsväg?',
    answer: 'Stanna omedelbart på ett trafiksäkert sätt, sätt på varningsblinkers och utför felsökning / utökad täthetskontroll. Fortsatt färd är förbjuden om trycket faller.',
    keyPoints: ['Stanna omedelbart trafiksäkert', 'Felsök & tillkalla bärgare vid behov']
  },
  {
    id: 54,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilka olika bromssystem finns på en modern tung lastbil?',
    answer: 'Färdbroms (fotbroms), parkeringsbroms (handbroms) och hjälpbromsar (avgasbroms och retarder).',
    keyPoints: ['Färdbroms', 'Parkeringsbroms', 'Hjälpbroms (avgasbroms & retarder)']
  },
  {
    id: 55,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilka hjul bromsas när du trycker på färdbromspedalen?',
    answer: 'Samtliga hjul på fordonet (och på tillkopplat släp).',
    keyPoints: ['Samtliga hjul']
  },
  {
    id: 56,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilka hjul bromsas normalt när parkeringsbromsen ansätts?',
    answer: 'Drivaxeln/drivaxlarna (där fjäderbromscylindrarna sitter).',
    keyPoints: ['Drivaxeln (fjäderbromscylindrar)']
  },
  {
    id: 57,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur fungerar en avgasbroms?',
    answer: 'Ett spjäll i avgasröret stängs vilket skapar mottryck för kolvarna i motorn och bromsar vevaxeln hydrauliskt/mekaniskt.',
    keyPoints: ['Spjäll i avgasröret stängs', 'Skapar mottryck i motorn']
  },
  {
    id: 58,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur fungerar en hydraulisk retarder?',
    answer: 'Olja pressas in mellan en roterande rotor och en fast stator vilket skapar friktion och bromskraft i drivlinan utan att bromsbeläggen slits.',
    keyPoints: ['Hydraulisk broms på kardanaxeln', 'Olja mellan rotor och stator', 'Sparar färdbroms']
  },
  {
    id: 59,
    category: 'Bromssystem & Tryckluft',
    question: 'Nämn en stor fördel och en allvarlig nackdel med att använda retarder?',
    answer: 'Fördel: Sparar färdbromsens skivor och belägg mot överhettning (fading) i långa nedförsbackar. Nackdel: Vid halka på vintern kan fordonet få sladd eller fällknivseffekt eftersom retardern endast bromsar drivaxeln.',
    keyPoints: ['Fördel: Förhindrar fading / slitage', 'Nackdel: Sladdrisk vid halka (bromsar endast drivaxel)']
  },
  {
    id: 60,
    category: 'Bromssystem & Tryckluft',
    question: 'Vad är den grundläggande skillnaden i funktion mellan färdbroms och parkeringsbroms?',
    answer: 'Färdbromsen behöver tryckluft för att BROMAS (tryck sätter an bromsen). Parkeringsbromsen har kraftiga fjädrar och behöver tryckluft för att LOSSAS.',
    keyPoints: ['Färdbroms: Behöver luft för att bromsa', 'P-broms: Behöver luft för att släppa fjädern']
  },
  {
    id: 61,
    category: 'Bromssystem & Tryckluft',
    question: 'Vid vilket tryck brukar det tidigast vara möjligt att lossa parkeringsbromsen?',
    answer: 'Normalt vid ca 5,5 till 6 bar.',
    keyPoints: ['Ca 5,5 – 6 bar']
  },
  {
    id: 62,
    category: 'Bromssystem & Tryckluft',
    question: 'Vid vilket lufttryck slår spärrventilen normalt till och låser fordonet automatiskt?',
    answer: 'När trycket i kretsen sjunker under ca 4,5–5,0 bar.',
    keyPoints: ['Under 4,5 – 5,0 bar']
  },
  {
    id: 63,
    category: 'Bromssystem & Tryckluft',
    question: 'Vilken livsviktig säkerhetsuppgift har spärrventilen?',
    answer: 'Den förhindrar att lastbilen sätts i ofrivillig rullning om föraren råkat lossa parkeringsbromsen av misstag vid lågt tryck och lämnat hytten. När kompressorn bygger tryck slår spärren till så bilen inte rullar iväg förrän föraren aktivt kvitterar den.',
    keyPoints: ['Förhindrar ofrivillig rullning', 'Kräver aktiv kvittering']
  },
  {
    id: 64,
    category: 'Allmän Fordonskontroll',
    question: 'Vad innebär fyrkretsskyddsventilens funktion vid ett tryckluftsbrott?',
    answer: 'Om en krets drabbas av läckage stänger fyrkretsventilen av den trasiga kretsen så att de övriga kretsarna behåller sitt tryck (normalt ca 4,5–5 bar).',
    keyPoints: ['Säkrar övriga kretsar vid läckage', 'Behåller resttryck i intakta kretsar']
  },
  {
    id: 65,
    category: 'Kopplingsanordning',
    question: 'Vilka kontroller görs på tryckluftsslangarna mellan dragbil och släpvagn (Duomatic / röd-gul ledning)?',
    answer: 'Kontrollera att slangarna är fria från sprickor och skav, att gummipackningarna är mjuka och hela, och att snabbkopplingen låser distinkt utan läckage.',
    keyPoints: ['Hela slangar utan skav', 'Gummipackningar intakta', 'Låsning distinkt']
  },
  {
    id: 66,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera gällande lastsäkring och sidolämmar före färd?',
    answer: 'Att lämmarna är reglade och låsta, att kapell/skåpdörrar är säkrade samt att spännband och surrningar är åtdragna utan fransning eller skador.',
    keyPoints: ['Låsta lämmar & dörrar', 'Hela och åtdragna surrningar']
  },
  {
    id: 67,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera gällande fordonets underkörningsskydd?',
    answer: 'Att bakre och sidomonterade underkörningsskydd är oskadade, korrekt fastbultade och inte deformerade eller för högt placerade från marken.',
    keyPoints: ['Oskadat & ordentligt fäst', 'Rätt höjd från marken']
  },
  {
    id: 68,
    category: 'Allmän Fordonskontroll',
    question: 'Vilken personlig skyddsutrustning ska alltid finnas med i fordonet?',
    answer: 'Varselväst (reflextyp), varningstriangel, skyddsskor, handskar och vid ADR/farligt gods relevant skyddsmask och ögonskölj.',
    keyPoints: ['Varselväst', 'Varningstriangel', 'Skyddsskor & handskar']
  },
  {
    id: 69,
    category: 'Bromssystem & Tryckluft',
    question: 'Hur kontrollerar du att fordonets lågtrycksindikator fungerar?',
    answer: 'Trampa upprepade gånger på bromspedalen med motorn avstängd tills trycket sjunker. Indikatorn (summer och röd varningslampa) ska lösa ut vid ca 5,5–6 bar.',
    keyPoints: ['Pumpa pedalen med motor avstängd', 'Summer/lampa ska aktiveras vid 5,5–6 bar']
  },
  {
    id: 70,
    category: 'Styrning & Vätskor',
    question: 'Vilka vätskor ska kontrolleras under motorhuven / frontluckan?',
    answer: 'Motorolja, kylarvätska (expansionskärl), spolarvätska, styrservoolja och eventuell kopplings-/bromsvätska.',
    keyPoints: ['Motorolja', 'Kylarvätska', 'Spolarvätska', 'Styrservoolja']
  },
  {
    id: 71,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera gällande fordonets belysning och reflexer?',
    answer: 'Halvljus, helljus, positionsljus, blinkers, dimljus, backljus, bromsljus, skyltlykta, sidomarkeringslyktor samt rena och hela reflexer (orange på sidor, röd bak).',
    keyPoints: ['Alla lyktor fungerar', 'Bromsljus & blinkers', 'Rätt färg på reflexer']
  },
  {
    id: 72,
    category: 'Allmän Fordonskontroll',
    question: 'Vad innebär begreppet "fading" på en tung lastbils bromsar?',
    answer: 'Att bromsbelägg och trummor/skivor överhettas vid långvarig inbromsning så att friktionen dramatiskt minskar eller upphör helt och bromspedalen sjunker.',
    keyPoints: ['Överhettning av bromsar', 'Friktionen försvinner', 'Förhindras med hjälpbromsar']
  },
  {
    id: 73,
    category: 'Kopplingsanordning',
    question: 'Vilken funktion har katastrofbromsvajern på ett släp med påskjutsbroms respektive tryckluftsspärren på tungt släp?',
    answer: 'Om släpet oavsiktligt lossnar drar vajern åt släpets handbroms, respektive sliter av matarledningen så släpets bromsar tvärnitar automatiskt.',
    keyPoints: ['Tvångsbromsar släpet vid lossning', 'Automatisk nödbroms']
  },
  {
    id: 74,
    category: 'Allmän Fordonskontroll',
    question: 'Hur kontrollerar du att ABS/EBS-lampan fungerar på fordon och släp?',
    answer: 'Slå på tändningen. Varningslamporna ska tändas för självtest och sedan slockna efter några sekunder eller när fordonet rullat upp i ca 5–7 km/h.',
    keyPoints: ['Tänds vid självtest', 'Slocknar efter start/rullning']
  },
  {
    id: 75,
    category: 'Allmän Fordonskontroll',
    question: 'Vad ska du kontrollera på vindrutan och siktfältet?',
    answer: 'Inga stenskott eller sprickor i förarens siktfält, att rutan är ren samt att torkarblad är mjuka och spolare fungerar effektivt.',
    keyPoints: ['Inga sprickor i siktfält', 'Torkarblad mjuka & rena', 'Spolarfunktion']
  },
  {
    id: 76,
    category: 'Allmän Fordonskontroll',
    question: 'Vilka handlingar / dokument ska medföras i lastbilen under färd?',
    answer: 'Registreringsbevis (del 1) för lastbil och eventuellt släp, eventuellt trafiktillstånd, fraktsedlar (CMR/CMR-not), instruktionsbok och vid ADR giltigt ADR-intyg.',
    keyPoints: ['Registreringsbevis del 1', 'Trafiktillstånd', 'Fraktsedlar']
  }
];
