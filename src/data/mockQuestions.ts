import { IMPORTED_CE_QUESTIONS, IMPORTED_YKB_QUESTIONS } from './teoriQuestionsBank';

export interface Question {
  id: number;
  categoryId: number; // 1: Fordonskännedom/manövrering, 2: Miljö, 3: Trafiksäkerhet, 4: Trafikregler, 5: Personliga förutsättningar
  question: string;
  options: string[];
  correct: number;
  optionSignLetters?: boolean;
  scene?: string;
  explanation?: string;
  sign?: {
    type: string;
    text?: string;
    icon?: any;
  };
}

export const B_PERSONBIL_QUESTIONS: Question[] = [
  {
    id: 1,
    categoryId: 4,
    question: "Vilket av följande vägmärken anger postombud?",
    options: [
      "Vägmärke A",
      "Vägmärke B",
      "Vägmärke C",
      "Vägmärke D"
    ],
    optionSignLetters: true,
    correct: 1,
    explanation: "Vägmärke B (posthornet på blå botten) anger postombud."
  },
  {
    id: 2,
    categoryId: 4,
    sign: { type: "vajningsplikt" },
    question: "Vad innebär detta vägmärke?",
    options: [
      "Du har stopplikt och måste alltid stanna innan du kör vidare",
      "Du har väjningsplikt mot trafik på den korsande vägen",
      "Varning för en farlig vägkorsning framöver",
      "Märket anger att korsande trafik har väjningsplikt mot dig"
    ],
    correct: 1,
    explanation: "Detta är märket för 'Väjningsplikt'. Du måste sänka farten och iaktta försiktighet, samt lämna företräde till fordon på den korsande vägen."
  },
  {
    id: 3,
    categoryId: 4,
    sign: { type: "stopplikt" },
    question: "Hur ska du uppträda när du närmar dig en korsning med detta vägmärke?",
    options: [
      "Jag ska stanna endast om det kommer mötande eller korsande fordon",
      "Jag måste alltid stanna helt vid stopplinjen, eller omedelbart innan den korsande körbanan om linje saknas, även om vägen är tom",
      "Jag ska rulla långsamt förbi och stanna endast om sikten är skymd",
      "Vägmärket anger att jag har förkörsrätt och att korsande trafik måste stanna"
    ],
    correct: 1,
    explanation: "Märket betyder 'Stopplikt'. Du måste stanna helt och hålla fordonet stilla en kort stund innan du kör vidare. Detta gäller oavsett om det finns trafik eller inte."
  },
  {
    id: 4,
    categoryId: 4,
    sign: { type: "parkering-forbud" },
    question: "Vad innebär detta vägmärke?",
    options: [
      "Du får inte stanna eller parkera här",
      "Förbud mot att parkera fordon. Det är dock tillåtet att stanna tillfälligt för på- eller avstigning samt lastning/lossning.",
      "Märket anger att det är fritt fram att parkera på jämna datum",
      "Detta anger att vägen är en återvändsgränd"
    ],
    correct: 1,
    explanation: "Detta märke förbjuder parkering. Att parkera innebär avsiktlig uppställning av ett fordon av andra skäl än trafikförhållanden, att undvika fara eller kortare i- och urlastning samt på- och avstigning."
  },
  {
    id: 5,
    categoryId: 4,
    sign: { type: "stanna-parkera-forbud" },
    question: "Vad innebär detta vägmärke?",
    options: [
      "Det är förbjudet att parkera, men tillåtet att stanna för att lossa gods",
      "Förbud mot att stanna och parkera fordon (gäller ej för att undvika fara eller vid köbildning/trafiksignal)",
      "Märket anger slutet på en parkeringszon",
      "Här får endast personbilar köra in"
    ],
    correct: 1,
    explanation: "Detta är märket för 'Förbud mot att stanna och parkera'. Det är strängare än parkeringsförbudet - du får inte ens stanna fordonet tillfälligt för att släppa av någon."
  },
  {
    id: 6,
    categoryId: 4,
    sign: { type: "motorvag" },
    question: "Vilka regler gäller på en väg som utmärks med detta vägmärke?",
    options: [
      "Gående och cyklister får använda vägrenen om de bär reflex",
      "Det är en motorväg. Endast motorfordon konstruerade för en hastighet av minst 40 km/h får köras här. Det är förbjudet att vända, backa eller stanna.",
      "Mopeder klass I (EU-moped) får köra här om hastighetsgränsen är under 90 km/h",
      "Detta är en påbörjad huvudled med fri hastighet"
    ],
    correct: 1,
    explanation: "Vägmärket anger 'Motorväg'. Här gäller strikta regler: ingen långsamgående trafik, inget vändande eller backande, och parkering/stopp är endast tillåtet på särskilt utmärkta parkeringsplatser."
  },
  {
    id: 7,
    categoryId: 1,
    question: "Du parkerar din bil i en kraftig nedförsbacke med trottoar på höger sida. Hur bör du vrida hjulen för att minimera risken att bilen rullar ut i gatan om handbromsen skulle svika?",
    options: [
      "Jag vrider hjulen rakt framåt för att hålla bilen stabil",
      "Jag vrider hjulen maximalt åt höger (så att framhjulen pekar mot trottoarkanten)",
      "Jag vrider hjulen maximalt åt vänster (så att de pekar ut mot gatan)",
      "Hjulens vinkel spelar ingen roll så länge växel 1 ligger i"
    ],
    correct: 1,
    explanation: "Genom att vrida hjulen åt höger (mot trottoaren) i en nedförsbacke kommer framdäcket att rulla mot och stoppas av trottoarkanten om bilen skulle börja rulla framåt."
  },
  {
    id: 8,
    categoryId: 1,
    question: "Du märker att ratten drar kraftigt åt ena hållet eller vibrerar under körning, särskilt vid inbromsning. Vad är den mest sannolika orsaken?",
    options: [
      "Bromsarna tar ojämnt, eller så är bromsskivorna skeva",
      "Spolarvätskan håller på att ta slut",
      "Stötdämparna bak är för stela",
      "Säkringen till ABS-systemet har gått"
    ],
    correct: 0,
    explanation: "Ojämn bromsverkan eller skeva bromsskivor leder ofta till att ratten drar åt sidan eller vibrerar när du bromsar. Detta bör åtgärdas snarast för din och andras säkerhet."
  },
  {
    id: 9,
    categoryId: 2,
    question: "Vilket av följande körsätt bidrar MEST till en miljövänlig och sparsam körning (Eco-driving)?",
    options: [
      "Att accelerera mycket långsamt på låg växel och alltid köra med halvljus",
      "Att planera körningen för att undvika onödiga stopp, hoppa över växlar vid acceleration, samt utnyttja motorbromsning",
      "Att köra på så låga varvtal att motorn hackar och stänga av motorn i alla nedförsbackar",
      "Att alltid köra med AC:n på max och ha lågt däcktryck för bättre friktion"
    ],
    correct: 1,
    explanation: "Eco-driving bygger på framförhållning och planering. Genom att motorbromsa, accelerera bestämt upp till marschfart och hoppa över växlar sparar du mycket bränsle."
  },
  {
    id: 10,
    categoryId: 2,
    question: "Vilken typ av utsläpp från bensin- och dieselfordon bidrar mest till bildandet av marknära ozon och ger upphov till andningsbesvär?",
    options: [
      "Kväveoxider (NOx) och kolväten",
      "Koldioxid (CO2)",
      "Rent vattenånga",
      "Syrgas"
    ],
    correct: 0,
    explanation: "Kväveoxider (NOx) och kolväten reagerar med solljus och bildar marknära ozon. Detta är skadligt för både växter, djur och människors luftvägar."
  },
  {
    id: 11,
    categoryId: 3,
    question: "Du kör i 90 km/h på torr asfalt och upptäcker ett akut hinder på vägen. Hur långt rullar bilen ungefär under din normala reaktionstid på 1 sekund (reaktionssträckan)?",
    options: [
      "Cirka 9 meter",
      "Cirka 15 meter",
      "Cirka 27 meter",
      "Cirka 45 meter"
    ],
    correct: 2,
    explanation: "Formeln för att uppskatta reaktionssträckan under 1 sekund är: stryk sista siffran i hastigheten och multiplicera med 3. För 90 km/h: 9 * 3 = 27 meter."
  },
  {
    id: 12,
    categoryId: 3,
    question: "Om du tredubblar hastigheten på din bil (t.ex. ökar från 30 km/h till 90 km/h), hur mycket längre blir bilens bromssträcka?",
    options: [
      "Den blir 3 gånger längre",
      "Den blir 6 gånger längre",
      "Den blir 9 gånger längre (ökar kvadratiskt)",
      "Bromssträckan förblir densamma om väglaget är torrt"
    ],
    correct: 2,
    explanation: "Bromssträckan ökar i kvadrat med hastigheten. Om hastigheten tredubblas (3x) blir bromssträckan 3 upphöjt till 2, vilket motsvarar 9 gånger längre (3 * 3 = 9)."
  },
  {
    id: 13,
    categoryId: 5,
    question: "Hur påverkas en förares synfält och förmåga av alkohol, även i mycket små mängder (t.ex. 0.2 promille)?",
    options: [
      "Synfältet breddas eftersom föraren blir mer avslappnad",
      "Avsökningsområdet blir smalare (tunnelsyn) och reaktionstiden ökar",
      "Förmågan av att upptäcka faror i mörker förbättras",
      "Alkohol har ingen påvisbar effekt under lagliga gränsvärden"
    ],
    correct: 1,
    explanation: "Redan vid mycket låga alkoholhalter drabbas föraren av sämre koordinationsförmåga, längre reaktionstid och ett krympt synfält, ofta kallat tunnelsyn."
  },
  {
    id: 14,
    categoryId: 5,
    question: "Vad är den vanligaste bidragande mänskliga faktorn bakom allvarliga singelolyckor på våra vägar?",
    options: [
      "Att föraren saknar formell utbildning på halkbana",
      "Trötthet, alkohol eller distraktion (t.ex. mobiltelefonanvändning)",
      "Att föraren kört med fel däckmönsterdjup",
      "Dåligt kalibrerade sidospeglar"
    ],
    correct: 1,
    explanation: "Mänskliga faktorer som trötthet, alkoholpåverkan och ouppmärksamhet/distraktion är de absolut dominerande orsakerna till allvarliga singelolyckor."
  },
  {
    id: 15,
    categoryId: 3,
    question: "Vilken är den farligaste typen av däckslitage ur trafiksäkerhetssynpunkt, särskilt vid regnigt väder?",
    options: [
      "Att däcken är slitna jämnt över hela ytan till under 1.6 mm mönsterdjup",
      "Att däcken har olika färg på fälgarna",
      "Att slitaget endast är på reservhjulet",
      "Att däcken är helt nya men har smutsiga däckssidor"
    ],
    correct: 0,
    explanation: "Mönsterdjup under 1.6 mm på sommardäck ökar risken för vattenplaning dramatiskt eftersom däcket inte kan leda bort vattnet under körbanan. Lagkravet är minst 1.6 mm."
  },
  {
    id: 16,
    categoryId: 4,
    question: "Du närmar dig ett obevakat övergångsställe där en fotgängare står redo att gå över. Vilken regel gäller enligt den så kallade 'Zebralagen'?",
    options: [
      "Fotgängaren har väjningsplikt eftersom bilar är större och har svårare att stanna",
      "Du har absolut väjningsplikt och ska i god tid sänka farten för att visa att fotgängaren tryggt kan korsa vägen",
      "Du ska blinka med helljuset för att signalera att fotgängaren får skynda sig över",
      "Regeln gäller endast om övergångsstället är belyst med gult blinkande sken"
    ],
    correct: 1,
    explanation: "Zebralagen föreskriver att fordonsförare har väjningsplikt mot fotgängare som har gått ut på eller just ska gå ut på ett obevakat övergångsställe."
  },
  {
    id: 17,
    categoryId: 1,
    question: "Hur kontrollerar du enklast att bilens servostyrning fungerar som den ska före färd?",
    options: [
      "Jag vrider på ratten när motorn är avstängd, den ska då gå mycket lätt",
      "Jag drar ratten hårt åt vänster samtidigt som jag startar motorn; ratten ska då genast mjukna och ge vika under trycket",
      "Jag gasar upp till 50 km/h och gör en kraftig sväng för att känna efter",
      "Jag kontrollerar servooljans färg med en teststicka i avgasröret"
    ],
    correct: 1,
    explanation: "Genom att dra i ratten (belasta styrsystemet) innan du startar motorn, och sedan starta, känner du tydligt när servon slår igång eftersom ratten plötsligt blir mycket lättare att ratta."
  },
  {
    id: 18,
    categoryId: 2,
    question: "Varför är det förbjudet att tvätta bilen på en asfalterad garageuppfart eller direkt på gatan?",
    options: [
      "Eftersom tvålen förstör asfalten och skapar sprickor i trottoaren",
      "Eftersom smutsvattnet med oljerester, tungmetaller och kemikalier rinner orenat ner i dagvattenbrunnen och direkt ut i närmaste sjö/vattendrag",
      "Det är endast förbjudet om man använder varmvatten",
      "Gatan blir hal för efterföljande motorcyklister"
    ],
    correct: 1,
    explanation: "Dagvattenbrunnar på gatan leder vattnet orenat ut i naturen. Vid biltvätt hemma rinner miljöfarliga ämnen (oljor, metaller, asfaltsrester) direkt ut i våra vattendrag. Använd istället en biltvätt."
  },
  {
    id: 19,
    categoryId: 3,
    question: "Vad är 'kollisionskraften' och hur förändras den om du krockar i 60 km/h jämfört med i 30 km/h?",
    options: [
      "Den blir dubbelt så stor (2x)",
      "Den förändras inte, bilens krockkuddar tar upp all skillnad",
      "Den blir fyra gånger så stor (4x, eftersom energin ökar i kvadrat)",
      "Den minskar på grund av bilens deformationszoner vid högre fart"
    ],
    correct: 2,
    explanation: "Rörelseenergin (och därmed kollisionskraften) ökar i kvadrat med hastigheten. Dubblar du farten (30 till 60) blir smällen fyra gånger så hård (2 upphöjt till 2 = 4)."
  },
  {
    id: 20,
    categoryId: 5,
    question: "Du kör hem sent på kvällen och känner att du har svårt att hålla ögonen öppna, samt att du börjar dras mot vägkanten. Vad är det säkraste att göra?",
    options: [
      "Jag skruvar upp volymen på stereon, öppnar rutan och kör fortare för att komma hem snabbare",
      "Jag stannar på en säker plats, dricker en kopp kaffe och tar en kort tupplur (powernap) på 15-20 minuter eller sover ut",
      "Jag dricker kallt vatten och fäster blicken hårt på mittlinjen",
      "Jag slår på varningsblinkers och fortsätter köra i samma takt"
    ],
    correct: 1,
    explanation: "Trötthet är livsfarligt i trafiken och kan jämföras med alkoholpåverkan. Det enda effektiva sättet att motverka akut sömnighet är sömn. En kort tupplur kan rädda liv."
  },
  {
    id: 21,
    categoryId: 4,
    sign: { type: "huvudled" },
    question: "Vad innebär detta vägmärke?",
    options: [
      "Varning för korsning där högerregeln gäller",
      "Vägen är en huvudled. Korsande trafik har väjningsplikt mot dig, och parkering är förbjuden längs vägen.",
      "Vägen övergår i motorväg om 500 meter",
      "Endast personbilar får trafikera vägen"
    ],
    correct: 1,
    explanation: "Märket anger att du kör på en huvudled. Korsande trafik har väjningsplikt eller stopplikt mot dig. På en huvudled är det dessutom förbjudet att parkera om inte särskild parkeringsplats anvisas."
  },
  {
    id: 22,
    categoryId: 4,
    sign: { type: "overgangsstalle" },
    question: "Vad innebär detta vägmärke och vilka regler gäller vid passagen?",
    options: [
      "Det anger ett obevakat övergångsställe där du har väjningsplikt mot fotgängare som gått ut eller just ska gå ut på övergångsstället",
      "Det anger en gångbana där bilar får köra i gångfart",
      "Fotgängare får endast gå över om det inte syns några fordon",
      "Du får köra om andra fordon strax före eller på detta märke"
    ],
    correct: 0,
    explanation: "Märket anger ett övergångsställe. Du har väjningsplikt mot gående och det är strikt förbjudet att köra om fordon strax före eller på ett obevakat övergångsställe."
  },
  {
    id: 23,
    categoryId: 4,
    sign: { type: "cirkulationsplats" },
    question: "Vilken regel gäller när du kör in i en cirkulationsplats (rondell) utmärkt med detta vägmärke?",
    options: [
      "Högerregeln gäller gentemot fordon inne i cirkulationen",
      "Du har väjningsplikt mot alla fordon som redan befinner sig inne i cirkulationsplatsen",
      "Du har alltid förkörsrätt när du kör in från en större väg",
      "Du måste alltid blinka vänster under hela tiden du befinner dig i rondellen"
    ],
    correct: 1,
    explanation: "Vägmärket för cirkulationsplats kombineras alltid med väjningsplikt. Du måste lämna företräde åt fordon som redan rör sig i cirkulationen."
  },
  {
    id: 24,
    categoryId: 4,
    sign: { type: "cykelbana" },
    question: "Vad anger detta påbudsmärke?",
    options: [
      "Varning för korsande cyklister",
      "Påbjuden bana för cykel och moped klass II. Annan fordonstrafik är i regel förbjuden.",
      "Moped klass I (EU-moped) måste köra här",
      "Cyklister måste leda cykeln förbi märket"
    ],
    correct: 1,
    explanation: "Detta är ett påbudsmärke för cykelbana. Här får endast cyklar och moped klass II färdas. Moped klass I (45 km/h) och bilar är förbjudna."
  },
  {
    id: 25,
    categoryId: 3,
    sign: { type: "varning-alg" },
    question: "När är risken för viltolyckor (t.ex. med älg och rådjur) som allra störst i Sverige?",
    options: [
      "Mitt på dagen i strålande solsken",
      "Under gryning och skymning, särskilt under månaderna maj-juni och september-november",
      "Bara under iskalla vinternätter mitt i januari",
      "Risken är exakt lika stor dygnet och året runt"
    ],
    correct: 1,
    explanation: "Viltet rör sig som mest i gryning och skymning i jakt på föda och vatten. Särskilt våren (när årskalvar stöts bort) och hösten (brunst och jakt) är högriskperioder."
  },
  {
    id: 26,
    categoryId: 1,
    question: "Vad är det minsta tillåtna mönsterdjupet på sommardäck respektive vinterdäck för personbil vid vinterväglag enligt svensk lag?",
    options: [
      "Sommardäck 1.0 mm, vinterdäck 2.0 mm",
      "Sommardäck minst 1.6 mm, vinterdäck minst 3.0 mm",
      "Båda kräver minst 4.0 mm",
      "Det finns ingen laggräns så länge korden inte syns"
    ],
    correct: 1,
    explanation: "Lagen föreskriver minst 1.6 mm mönsterdjup för sommardäck i däckets huvudmönster, och minst 3.0 mm för vinterdäck (friktion eller dubb) vid vinterväglag under perioden 1 december - 31 mars."
  },
  {
    id: 27,
    categoryId: 1,
    question: "Hur känner du enklast att bilens ABS-bromsar fungerar vid en panikinbromsning?",
    options: [
      "Bromspedalen faller helt i botten utan motstånd",
      "Bromspedalen pulserar eller vibrerar under foten samtidigt som ett knarrande ljud hörs, men styrförmågan bibehålls",
      "Bilen sladdar okontrollerat och alla hjul låser sig helt",
      "ABS-lampan lyser konstant med fast rött sken i instrumentpanelen"
    ],
    correct: 1,
    explanation: "När ABS aktiveras känner föraren tydliga vibrationer och pulseringar i bromspedalen. Det beror på att systemet blixtsnabbt släpper och nyper bromsarna för att förhindra hjullåsning så att du kan styra undan hindret."
  },
  {
    id: 28,
    categoryId: 2,
    question: "Hur påverkas bränsleförbrukningen om du kör med en takbox monterad på bilen även när den är tom?",
    options: [
      "Förbrukningen minskar tack vare förbättrad aerodynamik",
      "Bränsleförbrukningen ökar märkbart (ca 10-15% i högre hastigheter) på grund av ökat luftmotstånd",
      "Det påverkar endast bränslet om man kör under 30 km/h",
      "Det har ingen mätbar inverkan på moderna bilar"
    ],
    correct: 1,
    explanation: "Takboxar och takräcken ökar bilens luftmotstånd avsevärt, vilket i landsvägs- och motorvägsfart leder till 10-15% högre bränsleförbrukning och onödiga koldioxidutsläpp."
  },
  {
    id: 29,
    categoryId: 2,
    question: "Hur lång tid får en bil i de flesta svenska kommuner maximalt stå på tomgång enligt lokala miljöföreskrifter?",
    options: [
      "Maximalt 1 minut (undantag för trafikköer eller nödvändigt arbete)",
      "Maximalt 10 minuter",
      "Maximalt 30 minuter om värmen är igång",
      "Det finns inga tidsgränser för tomgång"
    ],
    correct: 0,
    explanation: "I nästan alla svenska kommuner råder förbud mot tomgångskörning i mer än 1 minut. Tomgång ger onödiga giftiga utsläpp i närmiljön där människor vistas."
  },
  {
    id: 30,
    categoryId: 3,
    question: "Vilken regel gäller för användning av bilbarnstol (bakåtvänd) på en passagerarplats utrustad med aktiv krockkudde (airbag)?",
    options: [
      "Det är tillåtet om barnet har hjälm på sig",
      "Det är livsfarligt och strängt förbjudet så länge krockkudden är aktiverad",
      "Det är godkänt om stolen lutas bakåt mer än 45 grader",
      "Det rekommenderas eftersom krockkudden ger extra mjukt skydd"
    ],
    correct: 1,
    explanation: "En krockkudde utlöses med explosionsartad kraft och kan döda eller allvarligt skada ett barn i en bakåtvänd bilbarnstol. Krockkudden MÅSTE kopplas ur helt innan placering sker där."
  },
  {
    id: 31,
    categoryId: 3,
    question: "Vad är ett fordon med 'understyrning' och hur reagerar bilen i en hal kurva?",
    options: [
      "Bilen svänger mer än rattutslaget och bakändan sladdar ut",
      "Bilen vill fortsätta rakt fram ur kurvan trots att framhjulen är vridna, på grund av förlorat framhjulsgrepp",
      "Bilen stannar automatiskt",
      "Bilen välter mot innerkurvan"
    ],
    correct: 1,
    explanation: "Understyrning innebär att framhjulen tappar greppet först. Bilen lyder inte styrningen utan plogar/strävar rakt fram i tangentens riktning."
  },
  {
    id: 32,
    categoryId: 5,
    question: "Vad innebär begreppet 'grupptryck' i samband med unga bilförare och olycksrisk?",
    options: [
      "Att föraren känner press att kontrollera däcktrycket i grupp",
      "Att kompisar i bilen kan få föraren att ta onödiga risker, köra för fort eller visa sig modig, vilket ökar olycksrisken flerfalt",
      "Att bilens fjädring säckar ihop när många sitter i bilen",
      "Att man måste köra samma bilmärke som familjen"
    ],
    correct: 1,
    explanation: "Statistik visar att unga förare med jämnåriga passagerare har markant högre olycksrisk på grund av social påverkan, distraktion och frestelsen att imponera eller hetsas till risktagande."
  },
  {
    id: 33,
    categoryId: 5,
    question: "Hur lång tid tar det i genomsnitt för människokroppen att förbränna alkoholen från en stor starköl (50 cl, 5%)?",
    options: [
      "Cirka 20 minuter med en promenad",
      "Cirka 2-3 timmar",
      "Cirka 8-10 timmar",
      "Alkoholen försvinner omedelbart om man dricker mycket vatten"
    ],
    correct: 1,
    explanation: "En stor starköl motsvarar cirka 1.5-2 standardglas alkohol. Kroppen förbränner ca 1.5-2 cl ren sprit i timmen, vilket innebär att det tar ca 2.5-3 timmar för levern att bryta ned alkoholen."
  },
  {
    id: 34,
    categoryId: 4,
    question: "Hur nära en järnvägskorsning är det förbjudet att parkera enligt trafikförordningen?",
    options: [
      "Närmare än 5 meter",
      "Närmare än 10 meter",
      "Närmare än 30 meter före och efter korsningen",
      "Parkering är alltid tillåten vid järnvägsövergångar om sikten är god"
    ],
    correct: 2,
    explanation: "Det är förbjudet att parkera inom ett avstånd av 30 meter före och 30 meter efter en järnvägs- eller spårvägskorsning."
  },
  {
    id: 35,
    categoryId: 4,
    question: "Vilken är bashastigheten inom tättbebyggt område i Sverige om inget annat anges med vägmärken?",
    options: [
      "30 km/h",
      "50 km/h",
      "70 km/h",
      "90 km/h"
    ],
    correct: 1,
    explanation: "Bashastigheten inom tättbebyggt område är enligt trafikförordningen 50 km/h om inte särskild hastighetsgräns (t.ex. 30 eller 40 km/h) skyltats."
  },
  {
    id: 36,
    categoryId: 1,
    question: "Vad är syftet med bilens katalysator?",
    options: [
      "Att kyla ned kylarvätskan i motorn",
      "Att via kemiska processer rena avgaserna från kolmonoxid, kolväten och kväveoxider till koldioxid, vatten och ofarligt kväve",
      "Att öka motorns effekt och bränsletryck",
      "Att filtrera bort partiklar i spolarvätskan"
    ],
    correct: 1,
    explanation: "Trevägskatalysatorn omvandlar de tre mest skadliga avgasämnena (kolmonoxid, oförbrända kolväten och kväveoxider) till mindre skadliga gaser när den uppnått sin driftstemperatur."
  },
  {
    id: 37,
    categoryId: 3,
    question: "Vad är 'synvillan' eller 'fartblindhet' och när uppstår den oftast?",
    options: [
      "Att man ser suddigt när man kör i tunnlar",
      "Att man efter en tids körning i hög fart på bred motorväg underskattar bilens faktiska hastighet när man ska svänga av på en skarp avfart",
      "Att man inte uppfattar vägmärken i solljus",
      "Att hastighetsmätaren visar fel värde"
    ],
    correct: 1,
    explanation: "Fartblindhet uppstår när ögat och hjärnan vant sig vid hög hastighet på fria motorvägar. När man sänker farten inför en avfart eller rondell känns 60 km/h som att man nästan står stilla, vilket leder till att man kör in i svängen alldeles för fort."
  },
  {
    id: 38,
    categoryId: 2,
    question: "Varför är det klokt att använda motorvärmare innan start under vinterhalvåret?",
    options: [
      "Bilen startar tystare men förbrukar lika mycket bränsle",
      "Motorn når snabbare arbetstemperatur, vilket minskar bränsleförbrukning, motorslitage och utsläpp av skadliga avgaser kraftigt de första kilometrarna",
      "Det krävs enligt lag så fort temperaturen sjunker under +10 grader",
      "Det värmer upp däcken så att de inte fryser fast i asfalten"
    ],
    correct: 1,
    explanation: "En kallstartad motor drar upp till dubbelt så mycket bränsle och renas knappt alls förrän katalysatorn är varm. En förvärmd motor minskar utsläpp och slitage markant."
  },
  {
    id: 39,
    categoryId: 4,
    question: "Får du använda dimbakljuset när du kör i tät köbildning i mörker med god sikt?",
    options: [
      "Ja, det ger extra säkerhet bakåt",
      "Nej, dimbakljuset är mycket starkt och bländar bakomvarande förare kraftigt vid god sikt eller i långsam kö",
      "Ja, det är obligatoriskt vid alla köer",
      "Endast om fordonet har automatisk avbländning"
    ],
    correct: 1,
    explanation: "Dimbakljus får endast användas vid kraftigt nedsatt sikt (t.ex. tjock dimma eller snörök). Så fort ett bakomvarande fordon har upptäckt dig eller ligger nära bakom ska det släckas för att inte blända."
  },
  {
    id: 40,
    categoryId: 5,
    question: "Vad innebär begreppet 'reaktionstid'?",
    options: [
      "Den tid det tar för bromsarna att hejda hjulens rotation",
      "Tiden från det att föraren upptäcker en fara tills att foten trycker ned bromspedalen",
      "Tiden från att man svänger på ratten tills bilen rör sig",
      "Den tid det tar att starta bilens motor"
    ],
    correct: 1,
    explanation: "Reaktionstiden är den tid det tar för hjärnan att registrera ett hinder, fatta beslut och överföra impulsen till musklerna för att påbörja inbromsningen. För en normal, utvilad förare är den ca 1 sekund."
  },
  {
    id: 41,
    categoryId: 4,
    question: "Vad innebär 'högerregeln' i en korsning där vägmärken eller trafiksignaler saknas?",
    options: [
      "Att förare på den bredaste vägen alltid kör först",
      "Att du har väjningsplikt mot fordon som närmar sig från höger",
      "Att du måste stanna helt innan du svänger till höger",
      "Att cyklister alltid måste väja för bilar"
    ],
    correct: 1,
    explanation: "Högerregeln är grundregeln i svensk trafik. Om inga vägmärken, trafiksignaler eller polismans tecken anger annat har du väjningsplikt mot trafik som kommer från höger."
  },
  {
    id: 42,
    categoryId: 4,
    question: "I vilka situationer gäller INTE högerregeln trots att vägmärken saknas (den så kallade utfartsregeln)?",
    options: [
      "När man kör ut från en parkeringsplats, fastighet, bensinmack, gårdsgata eller gångfartsområde",
      "När man svänger till vänster i en vanlig fyrvägskorsning",
      "När sikten är mycket god",
      "Högerregeln gäller alltid utan undantag"
    ],
    correct: 0,
    explanation: "Utfartsregeln föreskriver väjningsplikt vid utfart från bl.a. parkering, fastighet, bensinstation, gågata, gångfartsområde eller när man korsar en trottoar/cykelbana."
  },
  {
    id: 43,
    categoryId: 1,
    question: "Hur kontrollerar du att bilens färdbromsar inte har ett hydrauliskt läckage innan du kör iväg?",
    options: [
      "Jag pumpar pedalen och trycker sedan hårt i 20-30 sekunder. Pedalen ska då stanna stumt och inte sjunka långsamt.",
      "Jag kollar att bromsskivorna är spegelblanka",
      "Jag drar i handbromsen och lyssnar efter klick",
      "Jag startar fläkten på högsta effekt"
    ],
    correct: 0,
    explanation: "Ett stumt pedaltryck under hård belastning visar att systemet håller tätt. Om pedalen sakta sjunker mot golvet finns det ett farligt läckage i bromshydrauliken."
  },
  {
    id: 44,
    categoryId: 2,
    question: "Varför rekommenderas att man växlar upp tidigt (vid ca 2000-2500 rpm) och undviker höga motorvarvtal?",
    options: [
      "Det sparar batteriet i bilen",
      "Låga varvtal minskar bränsleförbrukningen, avgasutsläppen och motorbullret betydligt",
      "Det ökar däckens livslängd",
      "Motorn stängs av om varvtalet överstiger 3000 rpm"
    ],
    correct: 1,
    explanation: "Ecodriving innebär att utnyttja motorns vridmoment på låga varvtal. Genom att växla upp tidigt och köra på högsta möjliga växel hålls bränsleförbrukningen och koldioxidutsläppen nere."
  },
  {
    id: 45,
    categoryId: 3,
    question: "Hur långt framför bilen lyser bilens halvljus respektive helljus upp vägen under normala förhållanden?",
    options: [
      "Halvljus ca 10 m, helljus ca 50 m",
      "Halvljus ca 40-45 m, helljus ca 100-150 m (eller mer med moderna LED/laser)",
      "Båda lyser exakt 80 meter",
      "Halvljus lyser 150 m och helljus 500 m"
    ],
    correct: 1,
    explanation: "Halvljuset är asymmetriskt och lyser upp ca 40-45 meter framåt (något längre på högerkanten). Helljuset lyser upp minst 100-150 meter, vilket ger betydligt längre siktsträcka i mörker."
  },
  {
    id: 46,
    categoryId: 3,
    question: "När är det förbjudet att använda helljus vid mörkerkörning?",
    options: [
      "När vägen är tillfredsställande belyst, vid möte med annat fordon, eller när du kör nära bakom ett annat fordon så att föraren bländas i backspegeln",
      "Det är endast förbjudet om det snöar",
      "Helljus är förbjudet på alla motorvägar",
      "Helljus får bara användas på sommaren"
    ],
    correct: 0,
    explanation: "Helljus får inte användas när det finns tillräcklig gatubelysning, vid möte med fordon (även tåg och båtar om det kan blända), eller vid körning bakom ett annat fordon."
  },
  {
    id: 47,
    categoryId: 5,
    question: "Hur påverkas en förares uppmärksamhet och reaktionsförmåga av att hålla på med mobiltelefonen under körning?",
    options: [
      "Reaktionsförmågan försämras i samma utsträckning som vid berusning (motsvarande ca 0.8 promille) och blicken lämnar vägen farligt länge",
      "Det har ingen effekt om man bara läser korta sms",
      "Uppmärksamheten förbättras eftersom man håller sig vaken",
      "Det är lagligt att SMS:a om man kör under 50 km/h"
    ],
    correct: 0,
    explanation: "Sedan 2018 är det enligt svensk lag förbjudet att använda mobiltelefon hållen i handen under körning om det påverkar körningen negativt. Distraktionen ökar olycksrisken mångdubbelt."
  },
  {
    id: 48,
    categoryId: 1,
    question: "Vad innebär att bilens däck har 'felaktigt lufttryck' (för lågt tryck)?",
    options: [
      "Bränsleförbrukningen ökar, däcken slits onödigt mycket på ytterkanterna och köregenskaperna/bromssträckan försämras",
      "Däcken slits enbart i mitten av slitbanan",
      "Bilen blir snabbare och säkrare",
      "Lufttrycket spelar ingen roll så länge det finns luft i däcket"
    ],
    correct: 0,
    explanation: "För lågt lufttryck ökar däckens rullmotstånd, vilket leder till ökad bränsleförbrukning, risk för överhettning och separation av slitbanan, samt ojämn förslitning på däckens skulderkanter."
  },
  {
    id: 49,
    categoryId: 4,
    question: "Vad gäller vid möte på en smal väg där det finns en mötesplats utmärkt med ett vitt 'M' på blå botten?",
    options: [
      "Den som har mötesplatsen på sin högra sida ska stanna och invänta det mötande fordonet",
      "Den som kör fortast kör alltid först",
      "Båda måste backa",
      "Den tyngsta bilen har alltid företräde"
    ],
    correct: 0,
    explanation: "Märket anger en mötesplats. Den förare som har mötesplatsen på sin sida ska stanna vid den för att underlätta mötet. Den som först kommer fram till mötesplatsen ska också stanna om det behövs."
  },
  {
    id: 50,
    categoryId: 4,
    question: "Hur långt före en sväng eller ett körfältsbyte bör du ge tecken med körriktningsvisaren (blinka)?",
    options: [
      "Exakt samtidigt som jag vrider på ratten",
      "I god tid innan jag påbörjar manövern, så att mina medtrafikanter hinner uppfatta min avsikt och anpassa sig",
      "Det räcker att blinka efter att manövern är klar",
      "Man behöver bara blinka om det finns polisbilar i närheten"
    ],
    correct: 1,
    explanation: "Trafikförordningen kräver att tecken ska ges i god tid före sväng, start från vägkant, vändning eller körfältsbyte så att medtrafikanter varnas i förväg."
  },
  {
    id: 51,
    categoryId: 3,
    question: "Vilken är den säkraste metoden för att kontrollera avståndet till framförvarande fordon vid körning i landsvägsfart?",
    options: [
      "Att ligga maximalt 5 meter bakom för att minska luftmotståndet",
      "Tresekundersregeln (välj ett fast riktmärke längs vägen, när bilen framför passerar ska det ta minst 3 sekunder innan du passerar samma märke)",
      "Att alltid köra med samma hastighet som bilen framför oavsett avstånd",
      "Att blinka med helljuset regelbundet"
    ],
    correct: 1,
    explanation: "Tresekundersregeln ger en säker tidsmarginal som täcker förarens reaktionstid (ca 1 sekund) och ger god bromsmarginal vid en oväntad inbromsning."
  },
  {
    id: 52,
    categoryId: 2,
    question: "Varför bör du undvika onödiga korta bilresor (under 3-5 km) ur ett miljöperspektiv?",
    options: [
      "För att däcken slits mer vid korta resor",
      "För att motorn och katalysatorn inte hinner nå sin arbetstemperatur, vilket leder till att reningen inte fungerar och utsläppen per kilometer blir extremt höga",
      "För att bromsarna rostar sönder vid korta turer",
      "Korta resor har ingen miljöpåverkan alls"
    ],
    correct: 1,
    explanation: "Under de första kilometrarna är motorn kall och katalysatorn har inte nått sin arbetstemperatur (+300-400°C). Utsläppen av giftiga kolväten och kolmonoxid är då mångdubbelt högre."
  },
  {
    id: 53,
    categoryId: 5,
    question: "Hur påverkas äldre förare generellt i trafiken jämfört med unga nyblivna förare?",
    options: [
      "Äldre förare har sämre omdöme och kör oftare för fort",
      "Äldre förare har stor erfarenhet och kompenserar ofta för långsammare reaktionstid och sämre mörkerseende genom defensiv körning och lägre hastighet",
      "Det finns inga skillnader alls",
      "Äldre förare är alltid inblandade i fler singelolyckor i hög fart"
    ],
    correct: 1,
    explanation: "Erfarna och äldre förare kör i regel mer defensivt, tar färre medvetna risker och anpassar farten väl, även om synförmåga och snabbhet vid komplicerade trafiksituationer kan avta med åldern."
  },
  {
    id: 54,
    categoryId: 4,
    question: "Vad innebär en heldragen gul linje målad på trottoarkanten?",
    options: [
      "Det är tillåtet att stanna men inte att parkera",
      "Förbud mot att både stanna och parkera fordon längs den sträckan",
      "Här får endast bussar stanna",
      "Det markerar en cykelbana"
    ],
    correct: 1,
    explanation: "En heldragen gul linje på kantstenen innebär förbud att stanna och parkera. En streckad gul linje innebär förbud att parkera (men tillåtet att stanna för på/avstigning)."
  },
  {
    id: 55,
    categoryId: 1,
    question: "Vad ska du göra om temperaturmätaren för motorns kylvätska plötsligt stiger till rött fält under färd?",
    options: [
      "Jag fortsätter köra i hög fart för att kyla motorn med fartvinden",
      "Jag stannar bilen säkert så snart som möjligt, stänger av motorn och låter den svalna innan jag kontrollerar kylarvätskenivån",
      "Jag öppnar genast kylarlocket medan motorn är kokhet",
      "Jag slår på vindrutetorkarna"
    ],
    correct: 1,
    explanation: "Överhettning kan leda till totalt motorhaveri (skuren motor eller blåst topplockspackning). Stanna genast och öppna ALDRIG expansionskärlet när motorn kokar då het ånga kan orsaka svåra brännskador."
  },
  {
    id: 56,
    categoryId: 3,
    question: "Vad är 'svart halka' (underkyld frost/is) och var uppstår den med störst sannolikhet?",
    options: [
      "Halka från nylagd svart asfalt på sommaren",
      "Ett osynligt tunt isskikt på vägbanan, ofta på broar, viadukter eller i skuggiga svackor nära vatten där fukt fryser till is",
      "Smutsiga vägar efter jordbruksmaskiner",
      "Oljespill vid bensinmackar"
    ],
    correct: 1,
    explanation: "Svart halka är lömsk eftersom vägen ser torr eller bara fuktig ut trots att den är täckt av spegelblank is. Broar och viadukter kyls underifrån och drabbas först."
  },
  {
    id: 57,
    categoryId: 4,
    question: "Får du bogsera ett annat fordon på en motorväg eller motortrafikled?",
    options: [
      "Ja, i högst 80 km/h",
      "Nej, bogsering på motorväg är i regel förbjuden. Undantag gäller endast om fordonet havererat på motorvägen och då får det endast bogseras på vägrenen fram till närmaste avfart i högst 30 km/h.",
      "Ja, men bara med bogserstång",
      "Ja, om varningsblinkers är påslagna på båda bilarna"
    ],
    correct: 1,
    explanation: "Bogsering är farligt i hög fart. På motorväg är bogsering strikt förbjuden förutom vid akut bärgning till närmaste avfart, på vägrenen i max 30 km/h."
  },
  {
    id: 58,
    categoryId: 2,
    question: "Vilket miljömärke eller drivmedelsval minskar fossila nettoutsläpp av växthusgaser mest?",
    options: [
      "Fossil 98-oktanig bensin",
      "El från förnybara energikällor (sol, vind, vatten) eller biogas/HVO100",
      "Standarddiesel med hög svavelhalt",
      "Det finns ingen skillnad mellan olika drivmedel"
    ],
    correct: 1,
    explanation: "Elbilar drivna med grön el och biodrivmedel som biogas eller förnybar HVO100 ger det lägsta fossila koldioxidavtrycket över livscykeln."
  },
  {
    id: 59,
    categoryId: 5,
    question: "Vad innebär det att köra med 'defensiv körstil'?",
    options: [
      "Att alltid köra i 20 km/h under hastighetsgränsen",
      "Att planera sin körning, hålla goda säkerhetsmarginaler, vara beredd på andras misstag och avstå från sin formella företrädesrätt vid behov för att undvika olyckor",
      "Att bromsa tvärt vid varje korsning",
      "Att aldrig köra om andra fordon"
    ],
    correct: 1,
    explanation: "Defensiv körning bygger på framförhållning, tydlighet, samspel och marginaler. Målet är att förutse faror och aldrig sätta sig i situationer där man är beroende av att andra gör rätt."
  },
  {
    id: 60,
    categoryId: 4,
    question: "Vilken regel gäller när ett utryckningsfordon (polis, ambulans, räddningstjänst) närmar sig med påslagna blåljus och siren?",
    options: [
      "Du ska stanna mitt i vägen och slå av motorn",
      "Du ska underlätta utryckningsfordonets framkomlighet genom att hålla åt sidan, sänka farten eller stanna om det krävs, dock utan att utsätta andra för fara",
      "Du ska öka farten för att köra ifrån utryckningsfordonet",
      "Du behöver bara lämna företräde om utryckningsfordonet körs på vänster sida"
    ],
    correct: 1,
    explanation: "Utryckningsfordon med påkallat larmsignal (blåljus + siren) har fri väg. Alla förare måste lämna fri väg genom att köra åt sidan eller stanna."
  },
  {
    id: 61,
    categoryId: 1,
    question: "Hur kontrollerar du att bilens styrning inte har otillåtet glapp (dödgång i ratten)?",
    options: [
      "Jag står utanför med öppen sidoruta och vickar lätt på ratten samtidigt som jag iakttar framhjulet; hjulet ska reagera omedelbart på minsta rattrörelse",
      "Jag snurrar ratten tre varv med motorn avstängd",
      "Jag kollar mätarställningen i bilen",
      "Jag kör i 100 km/h och släpper ratten i 5 sekunder"
    ],
    correct: 0,
    explanation: "Styrningen ska vara distinkt utan glapp. Genom att titta på framhjulet utifrån och röra ratten ser du direkt om hjulet rör sig utan fördröjning."
  },
  {
    id: 62,
    categoryId: 3,
    question: "Vad är 'vattenplaning' och vad är det absolut viktigaste du ska göra om din bil råkar ut för det?",
    options: [
      "Bromsa hårt och rycka i handbromsen",
      "Styra kraftigt mot vägrenen",
      "Släppa gasen mjukt, trampa ned kopplingen (eller släppa gaspedalen i automat), hålla ratten rak och INTE panikbromsa",
      "Gasa fullt för att skära igenom vattnet"
    ],
    correct: 2,
    explanation: "Vid vattenplaning flyter däcken ovanpå vattenfilmen och all styr- och bromsförmåga upphör tillfälligt. Trampa ned kopplingen och håll ratten rak tills däcken återfår kontakten med asfalten."
  },
  {
    id: 63,
    categoryId: 2,
    question: "Vilken miljöpåverkan har partiklar (PM10) som rivs upp från vägbanan, särskilt från dubbdäck under våren?",
    options: [
      "De är nyttiga för växtligheten längs vägarna",
      "De tränger djupt ner i människors luftvägar och lungor och orsakar hjärt- och kärlsjukdomar samt andningsbesvär",
      "De har ingen påvisad hälsoeffekt",
      "De reflekterar solljuset och motverkar växthuseffekten"
    ],
    correct: 1,
    explanation: "Partiklar från dubbdäck och asfaltslitage (PM10 och PM2.5) är ett stort folkhälsoproblem i tätorter, vilket är anledningen till att vissa gator har dubbdäcksförbud."
  },
  {
    id: 64,
    categoryId: 5,
    question: "Vad innebär begreppet 'överinlärning' och varför är det avgörande för en säker förare?",
    options: [
      "Att man pluggat för mycket teori och blir förvirrad",
      "Att grundläggande manövrer (som växling, styrning och bromsning) automatiserats så att förarens hjärnkapacitet frigörs till att scanna av trafiken, upptäcka risker och fatta säkra beslut",
      "Att man kör upprepade gånger på samma väg tills man tröttnar",
      "Att man memorera provfrågor utantill"
    ],
    correct: 1,
    explanation: "När manövrer sitter i ryggmärgen (överinlärning) behöver hjärnan inte fokusera på pedalerna eller växelspaken, utan all koncentration kan riktas mot att läsa av trafiken."
  },
  {
    id: 65,
    categoryId: 4,
    question: "Vilken regel gäller när du ska svänga vänster i en korsning på en landsväg med mötande trafik och bakomvarande bilar?",
    options: [
      "Jag stannar mitt i vägen med blinkers på och väntar",
      "Vänstersväng på landsväg är mycket riskfylld. Om det kommer mötande trafik och bakomvarande bilar ligger nära bör du fortsätta rakt fram, vända på en säker plats och göra en högersväng istället.",
      "Jag ska gasa snabbt för att hinna före mötande",
      "Mötande trafik har väjningsplikt mot vänstersvängande"
    ],
    correct: 1,
    explanation: "Vänstersväng från landsväg är en av de dödligaste olyckstyperna i Sverige p.g.a. risken att bli påkörd bakifrån i 80-100 km/h och knuffas framför mötande fordon. Fortsätt framåt och vänd om det inte är helt tomt."
  }
];

export const AM_MOPED_QUESTIONS: Question[] = [
  {
    id: 201,
    categoryId: 4,
    question: "Vilken är den högsta tillåtna hastigheten som en moped klass I (EU-moped) är konstruerad för och får framföras i?",
    options: [
      "25 km/h",
      "30 km/h",
      "45 km/h",
      "50 km/h"
    ],
    correct: 2,
    explanation: "En moped klass I (EU-moped) är konstruerad för en hastighet av högst 45 km/h och kräver AM-kort."
  },
  {
    id: 202,
    categoryId: 4,
    question: "Får du köra en moped klass I på en cykelbana?",
    options: [
      "Ja, om jag anpassar hastigheten till fotgängare",
      "Nej, en moped klass I ska köras på körbanan (vägen) och får aldrig framföras på cykelbana",
      "Ja, men endast om cykelbanan är bredare än 2 meter",
      "Ja, om det saknas trottoar bredvid vägen"
    ],
    correct: 1,
    explanation: "Moped klass I är ett registrerat motorfordon och ska framföras på körbanan. Moped klass II får däremot köras på cykelbana om inte skylten 'Moped klass II ej tillåten' finns."
  },
  {
    id: 203,
    categoryId: 3,
    question: "Vilken typ av hjälm är du enligt lag skyldig att bära när du kör moped?",
    options: [
      "En vanlig cykelhjälm eller skateboardhjälm duger utmärkt",
      "En godkänd skyddshjälm (integralhjälm, öppen hjälm eller crosshjälm) som är E- eller SIS-märkt",
      "Det finns inget hjälmkrav om mopeden körs på enskild väg",
      "En plasthjälm utan spänne är godkänd om farten understiger 25 km/h"
    ],
    correct: 1,
    explanation: "Förare och passagerare på moped måste använda en godkänd skyddshjälm. Den ska vara E-godkänd eller uppfylla svensk standard (SIS)."
  },
  {
    id: 204,
    categoryId: 2,
    question: "Vad blir konsekvensen för miljö och säkerhet om du trimmar din moped så att den går snabbare?",
    options: [
      "Mopeden drar mindre bränsle eftersom resan tar kortare tid",
      "Utsläppen av skadliga avgaser ökar kraftigt, bromsarna räcker inte till för farten, och mopeden klassas juridiskt som oregistrerad lätt motorcykel vilket leder till dagsböter och uppskjutet körkortstillstånd",
      "Mopeden blir säkrare eftersom du lättare kan följa trafikrytmen på 70-vägar",
      "Motorn slits mindre eftersom den får arbeta på högre varvtal"
    ],
    correct: 1,
    explanation: "Att köra trimmad moped innebär att du framför en oregistrerad och osäkrad motorcykel. Det ger stränga straff såsom dagsböter och indraget eller uppskjutet körkortstillstånd för bil."
  },
  {
    id: 205,
    categoryId: 5,
    question: "Du har druckit alkohol under kvällen och ska köra hem nästa morgon. Vad är den största risken?",
    options: [
      "Att polisen inte ser dig om du kör på cykelbanan",
      "Att du fortfarande har alkohol kvar i blodet vilket försämrar din körförmåga avsevärt och gör att du kan dömas för rattfylleri",
      "Att mopedens tändstift sotar igen",
      "Att du blir hungrig under resan"
    ],
    correct: 1,
    explanation: "Alkoholförbränning tar tid och kan inte påskyndas med kaffe, sömn eller bastu. Du kan mycket väl ha kvarvarande alkohol i kroppen dagen efter och utgöra en stor trafikfara."
  }
];

export const HEAVY_QUESTIONS: Question[] = [
  {
    id: 301,
    categoryId: 1,
    question: "Vilket bromssystem är obligatoriskt på tunga lastbilar (över 16 ton) och hur fungerar det i huvudsak?",
    options: [
      "Hydrauliskt bromssystem med vakuumservo (liknande personbilar)",
      "Tryckluftsbromssystem, där lufttrycket används för att pressa isär bromsbackarna eller pressa ihop bromsklossarna vid bromsning",
      "Elektriska magnetbromsar monterade direkt på drivaxeln",
      "Bromsvajrar kopplade till en central handspak"
    ],
    correct: 1,
    explanation: "Tunga fordon använder tryckluftsbromsar eftersom det ger mycket stor bromskraft och gör det möjligt att enkelt koppla bromsar till ett släpfordon via luftslangar."
  },
  {
    id: 302,
    categoryId: 4,
    question: "Enligt kör- och vilotidsreglerna, hur lång sammanhängande rast måste en förare av ett tungt fordon ta efter senast 4.5 timmars körning?",
    options: [
      "Minst 15 minuter",
      "Minst 30 minuter",
      "Minst 45 minuter (eller delas upp i 15 + 30 minuter under körtiden)",
      "Det räcker med en 5-minuters bensträckare varje timme"
    ],
    correct: 2,
    explanation: "Efter 4.5 timmars körning ska föraren ta en sammanhängande rast på minst 45 minuter, såvida han inte påbörjar en viloperiod. Rasten kan delas upp i en del om minst 15 minuter följd av en del om minst 30 minuter."
  },
  {
    id: 303,
    categoryId: 3,
    question: "Vad innebär termen 'döda vinkeln' för en förare av en tung lastbil vid en högersväng i en korsning?",
    options: [
      "Det område precis bakom lastbilen där backkameran inte når",
      "Ett stort dolt sidosiktefält på höger sida om hytten där cyklister eller fotgängare kan befinna sig helt osynliga för föraren trots backspeglar",
      "Att motorn tappar kraft under svängning",
      "Att vindrutetorkarna lämnar en fläck otorkad på rutan"
    ],
    correct: 1,
    explanation: "Tunga lastbilar har stora dolda vinklar, särskilt på höger sida. Det är kritiskt vid högersvängar att föraren kontrollerar alla speglar noggrant för att undvika olyckor med oskyddade trafikanter."
  },
  {
    id: 304,
    categoryId: 1,
    question: "Vad är syftet med en så kallad 'avlastare' (eller boggielyft) på en tung lastbil?",
    options: [
      "Att tömma flaket snabbare vid tippning",
      "Att kunna lyfta en axel när bilen är olastad/lätt lastad för att minska däckslitage, bränsleförbrukning samt ge bättre grepp på drivaxeln vid halt väglag",
      "Att sänka hytten så att det blir lättare att kliva in",
      "Att koppla ifrån släpvagnens bromsar automatiskt"
    ],
    correct: 1,
    explanation: "Boggielyften tillåter föraren att lyfta en av axlarna när fordonet är tomt. Det sparar däck och bränsle, samt ökar trycket på drivaxeln för bättre fäste när det är halt."
  },
  {
    id: 305,
    categoryId: 2,
    question: "Vad är AdBlue och varför används det i moderna dieseldrivna tunga fordon?",
    options: [
      "Ett tillsatsmedel i spolarvätskan för att förhindra isbildning på strålkastarna",
      "En urealösning som sprutas in i avgassystemet (SCR-katalysatorn) för att omvandla skadliga kväveoxider (NOx) till ofarligt kväve och vatten",
      "Ett smörjmedel till växellådan för att minska buller",
      "Ett bränsleadditiv som ökar motorns hästkrafter med 20%"
    ],
    correct: 1,
    explanation: "AdBlue används i SCR-systemet (Selective Catalytic Reduction) på moderna dieselmotorer för att drastiskt reducera utsläppen av hälsofarliga kväveoxider (NOx) och uppfylla stränga utsläppskrav."
  }
];

export const YKB_QUESTIONS: Question[] = [
  {
    id: 401,
    categoryId: 3,
    question: "Varför är surrning och säkring av lasten extremt viktigt ur ett trafiksäkerhets- och fysikaliskt perspektiv?",
    options: [
      "Endast för att undvika att godset blir smutsigt av fartvinden",
      "För att förhindra att godset förskjuts vid kraftiga inbromsningar, kurvor eller undanmanövrar, vilket annars kan leda till att fordonet välter eller att lasten tränger in i förarhytten/faller av flaket",
      "För att hålla lasten varm under kalla vintertransporter",
      "Det behövs inte surras om lasten väger mer än 5 ton eftersom tyngden håller den på plats"
    ],
    correct: 1,
    explanation: "När ett fordon svänger eller bromsar verkar enorma tröghetskrafter på lasten. Osäkrad last rör sig mycket lätt, vilket förändrar tyngdpunkten och kan få hela ekipaget att välta."
  },
  {
    id: 402,
    categoryId: 5,
    question: "Vad innebär 'ergonomiskt arbete' för en yrkesförare under en lång arbetsdag?",
    options: [
      "Att köra så fort som möjligt så att arbetspasset blir kort",
      "Att ställa in förarstolen, ratten och speglarna optimalt, variera sin körställning, samt använda rätt lyftteknik vid manuell godshantering för att förebygga långvariga rygg- och nackskador",
      "Att alltid sova med huvudet nedåt under vilan",
      "Att använda löst sittande skor för att kunna röra tårna lättare under körning"
    ],
    correct: 1,
    explanation: "Ergonomi är nyckeln till en lång karriär som yrkesförare. Rätt inställd stol dämpar vibrationer och skonar ryggslutet, och korrekta lyft minskar risken för akuta förslitningsskador."
  },
  {
    id: 403,
    categoryId: 4,
    question: "Vilken är den absolut högsta sammanlagda körtiden per vecka (veckokörtid) som tillåts enligt gällande kör- och vilotidsförordning?",
    options: [
      "Maximalt 40 timmar",
      "Maximalt 56 timmar",
      "Maximalt 90 timmar",
      "Det finns ingen maxgräns per vecka så länge man vilar 9 timmar per dygn"
    ],
    correct: 1,
    explanation: "Den maximala körtiden under en enskild vecka får inte överstiga 56 timmar. Dessutom får den sammanlagda körtiden under två på varandra följande veckor inte överstiga 90 timmar."
  },
  {
    id: 404,
    categoryId: 4,
    question: "Hur ofta måste en yrkesförare genomgå fortbildning (YKB-förnyelse) för att behålla sin yrkesförarkompetens?",
    options: [
      "Varje år (10 timmar)",
      "Vart tredje år (25 timmar)",
      "Vart femte år (en fortbildning om minst 35 timmar)",
      "YKB gäller på livstid när man väl klarat grundprovet"
    ],
    correct: 2,
    explanation: "Yrkesförarkompetensbeviset (YKB) har en giltighetstid på 5 år. För att förnya det måste föraren gå en fortbildning på 35 timmar hos en godkänd utbildningsanordnare."
  },
  {
    id: 405,
    categoryId: 1,
    question: "Vilken typ av lastsäkringsmetod är bäst lämpad för att förhindra att styckegods glider på flaket om man använder träpallar på ett metallunderlag?",
    options: [
      "Att endast lägga ett nät över godset",
      "Kombination av friktionsmattor (antiglid-mattor) under pallarna och ordentlig överfallssurrning med spännband",
      "Att stapla pallarna så högt att de tar i taket på skåpet",
      "Att köra mycket långsamt i alla kurvor så att friktionen räcker till"
    ],
    correct: 1,
    explanation: "Friktionsmattor ökar friktionskoefficienten avsevärt, vilket drastiskt minskar den surrningsstyrka som krävs för att säkra lasten säkert mot tröghetskrafterna."
  },
  ...IMPORTED_YKB_QUESTIONS
];

// NEW LICENSE POOLS

export const A_MOTORCYKEL_QUESTIONS: Question[] = [
  {
    id: 501,
    categoryId: 1,
    scene: "motorcycle",
    question: "Hur bör du fördela bromsverkan mellan fram- och bakbromsen vid en maximal inbromsning på torr asfalt med en motorcykel utan ABS-bromsar?",
    options: [
      "Jag bromsar till 100% med bakbromsen och helt undviker frambromsen",
      "Cirka 70-80% med frambromsen och 20-30% med bakbromsen",
      "Hälften på varje, 50% fram och 50% bak",
      "Jag pumpbromsar hårt med båda bromsarna samtidigt för att undvika hjullåsning"
    ],
    correct: 1,
    explanation: "Vid inbromsning flyttas mönstret för viktfördelning framåt, vilket ökar greppet på framhjulet dramatiskt. Frambromsen står därför för merparten av bromsverkan (70-80%)."
  },
  {
    id: 502,
    categoryId: 3,
    scene: "motorcycle",
    question: "Du ska köra igenom en skymd högerkurva på en landsväg med motorcykel. Hur bör du placera dig i ditt körfält inför svängen?",
    options: [
      "Nära högerkanten för att undvika mötande bilar",
      "Nära mittlinjen (till vänster i ditt körfält) för att förbättra din siktsträcka genom kurvan",
      "Helt i mitten av körfältet",
      "På vägrenen för att ha maximal säkerhet"
    ],
    correct: 1,
    explanation: "Genom att ligga nära mittlinjen inför en högerkurva öppnar du upp din siktlinje och kan upptäcka hinder eller mötande trafik betydligt tidigare."
  },
  {
    id: 503,
    categoryId: 1,
    question: "Vad innebär 'motstyrning' (countersteering) vid körning av en motorcykel i högre hastigheter?",
    options: [
      "Att styra kraftigt åt motsatt håll för att korrigera en bakhjulssladd",
      "Att ge ett lätt tryck framåt på det högra handtaget för att initiera en snabb och stabil lutning åt höger",
      "Att luta kroppen åt motsatt håll som motorcykeln svänger",
      "Att bromsa med bakbromsen under kurvtagning"
    ],
    correct: 1,
    explanation: "Motstyrning är den fysikaliska teknik där du genom att trycka lätt på styret i motsatt riktning får motorcykeln att snabbt och precist tippa in i kurvan."
  },
  {
    id: 504,
    categoryId: 3,
    question: "Vilken är den vanligaste olyckstypen där en motorcykel och en personbil krockar i en korsning?",
    options: [
      "Personbilen kör på motorcykeln bakifrån vid rödljus",
      "Vänstersvängande personbil svänger framför en mötande motorcykel på grund av att bilföraren missbedömer MC-förarens hastighet",
      "Motorcykeln kör om på höger sida",
      "Sidokrock i en cirkulationsplats"
    ],
    correct: 1,
    explanation: "Detta är en klassisk korsningsolycka. Eftersom en motorcykel har en smal profil missbedömer bilförare ofta dess avstånd och hastighet, och påbörjar en vänstersväng framför MC:n."
  }
];

export const BE_SLAP_QUESTIONS: Question[] = [
  {
    id: 601,
    categoryId: 1,
    scene: "trailer-hitch",
    question: "Vad händer med ekipagets stabilitet om du lastar släpvagnen så att kultrycket blir alldeles för lågt eller negativt?",
    options: [
      "Ekipaget blir mycket stadigt och framhjulen får extra bra grepp",
      "Släpet kan börja självsvänga ('åla sig') dramatiskt vid högre hastigheter, och bakre hjulparen på dragbilen lyfts, vilket gör att man tappar kontrollen",
      "Släpbilens strålkastare pekar för högt upp i luften",
      "Släpvagnens påskjutsbroms slutar fungera automatiskt"
    ],
    correct: 1,
    explanation: "För lågt kultryck lyfter upp dragbilens bakvagn. Detta minskar bilens stabilitet och väggrepp extremt, med hög risk för våldsamma självsvängningar (wobbling) hos släpet."
  },
  {
    id: 602,
    categoryId: 4,
    question: "Vad är den högsta tillåtna hastigheten för en personbil som drar en tillkopplad bromsad släpvagn på en motorväg?",
    options: [
      "70 km/h",
      "80 km/h",
      "90 km/h",
      "100 km/h"
    ],
    correct: 1,
    explanation: "Den maximala tillåtna hastigheten för en bil med tillkopplat släp (både bromsat och obromsat som uppfyller vissa villkor) är 80 km/h på samtliga vägar."
  },
  {
    id: 603,
    categoryId: 1,
    question: "Hur fungerar påskjutsbromsen på en vanlig släpvagn till en personbil?",
    options: [
      "Bromsningen styrs elektroniskt via bilens bromspedal och en kabel",
      "När dragbilen bromsar trycker släpvagnens tyngd mot bilens dragkrok, vilket skjuter ihop en dragstång som mekaniskt aktiverar släpets bromsar",
      "Den bromsar endast om dragbilens hjul tappar fästet",
      "Den fungerar med tryckluft från dragbilens motor"
    ],
    correct: 1,
    explanation: "Påskjutsbromsen är ett rent mekaniskt tröghetssystem. När bilen bromsar vill släpvagnen skjuta på, vilket trycker ihop påskjutsmekanismen och spänner bromsvajrarna på släpvagnen."
  }
];

export const C_LASTBIL_QUESTIONS: Question[] = [
  ...HEAVY_QUESTIONS,
  {
    id: 701,
    categoryId: 1,
    scene: "truck-underrun",
    question: "Vilken funktion fyller underkörningsskyddet på sidorna och bak på en tung lastbil?",
    options: [
      "Att förhindra stenskott och smuts från att slungas mot andra fordon",
      "Att hindra cyklister, fotgängare eller mindre personbilar från att hamna under lastbilens hjul vid en krock eller sväng",
      "Att minska turbulens och sänka dieselförbrukningen",
      "Att fungera som stötdämpare vid lastning på lastbryggor"
    ],
    correct: 1,
    explanation: "Underkörningsskydd är en viktig passiv säkerhetsutrustning. De stänger av tomrummen under lastbilen så att oskyddade trafikanter eller bilar inte kan dras in under fordonet i händelse av en kollision."
  },
  {
    id: 702,
    categoryId: 1,
    question: "Hur reagerar en tryckluftsbroms om systemet drabbas av ett totalt luftläckage och trycket sjunker under ett kritiskt värde?",
    options: [
      "Bromsarna slutar helt att fungera och fordonet blir bromslöst",
      "Spärrventilen löser ut och de kraftiga fjäderbromsarna (parkeringsbromsen) slår till automatiskt och stannar fordonet",
      "Ekipaget kan fortsätta köra men varningslampan tänds",
      "Hydrauloljan tar över bromskraften automatiskt"
    ],
    correct: 1,
    explanation: "I tunga fordon hålls fjäderbromsen öppen med tryckluft. Om trycket försvinner (luftläckage) trycker de massiva mekaniska fjädrarna genast på bromsarna, vilket låser hjulen av säkerhetsskäl."
  }
];

export const CE_SLAP_QUESTIONS: Question[] = [
  {
    id: 801,
    categoryId: 3,
    scene: "jackknife",
    question: "Vad innebär termen 'fällknivsverkan' (jackknifing) för en lastbil med släpvagn?",
    options: [
      "Att släpvagnskopplingen går av under färd",
      "Att dragbilens bakhjul förlorar fästet vid bromsning på halka, varvid släpet skjuter på så att ekipaget viker sig okontrollerat som en fällkniv",
      "Att lastbilen välter i en kurva på grund av sidvind",
      "Att luftfjädringen på ena sidan kollapsar"
    ],
    correct: 1,
    explanation: "Om dragbilen förlorar sidgreppet bak medan släpvagnen fortsätter skjuta på framåt vid en hård bromsning, viker sig släp och bil mot varandra. Detta kallas fällknivsverkan och är mycket farligt."
  },
  {
    id: 802,
    categoryId: 1,
    question: "Varför har en släpvagn till en tung lastbil en så kallad 'katastrofventil' (avbrytningsventil) på tryckluftsslangen?",
    options: [
      "För att tömma däcken på luft om fordonet välter",
      "För att omedelbart katastrofbromsa släpet automatiskt om det skulle lossna från dragbilen under körning",
      "För att kyla ner bromsarna i extremt långa nedförsbackar",
      "För att föraren ska kunna släppa ut kondensvatten från hytten"
    ],
    correct: 1,
    explanation: "Katastrofventilen ser till att släpets bromsar låser sig direkt om de röda tryckluftsslangarna slits av (t.ex. om släpet kopplas loss oavsiktligt under färd)."
  },
  ...IMPORTED_CE_QUESTIONS
];

export const D_BUSS_QUESTIONS: Question[] = [
  {
    id: 901,
    categoryId: 4,
    scene: "bus-stop",
    question: "Du kör en buss i linjetrafik och närmar dig en hållplats där du ska starta efter ett stopp. Vägen har en hastighetsbegränsning på 50 km/h. Vilken regel gäller?",
    options: [
      "Jag måste vänta tills alla bilar har passerat eftersom jag startar från kanten",
      "Mina medtrafikanter har väjningsplikt mot min buss om jag ger tecken med blinkers i god tid före start",
      "Jag har alltid företräde oavsett vägens hastighetsbegränsning",
      "Bilar har endast väjningsplikt om bussen är en skolbuss med blinkande ljusskylt"
    ],
    correct: 1,
    explanation: "Enligt svensk lag har medtrafikanter väjningsplikt mot en buss som blinkar ut från en hållplats om vägens hastighetsgräns är högst 50 km/h. Om gränsen är 60 km/h eller högre har busschauffören väjningsplikt."
  },
  {
    id: 902,
    categoryId: 3,
    question: "Vilka skyldigheter har du som bussförare gällande bilbälten för passagerare som är under 15 år?",
    options: [
      "Inget ansvar alls, det är alltid föräldrarnas eller passagerarnas eget ansvar",
      "Jag måste vidta åtgärder för att se till att passagerare under 15 år bältar sig, till exempel genom meddelande, skyltar eller muntlig uppmaning",
      "Bussar är undantagna från bälteslagar i Sverige",
      "Det är endast polisen som bär ansvaret vid en kontroll"
    ],
    correct: 1,
    explanation: "Föraren (eller personalen ombord) ska vidta åtgärder så att passagerare under 15 år bältar sig om det finns bälten i bussen. För äldre passagerare räcker det med allmän information."
  }
];

export const DE_SLAP_QUESTIONS: Question[] = [
  {
    id: 1001,
    categoryId: 1,
    question: "Hur förändras svepytan och spårföljden hos en lång ledvagn eller en buss med tillkopplad tung släpvagn vid svängning?",
    options: [
      "Svepytan blir mindre eftersom fordonet är ledat",
      "Svepytan ökar dramatiskt; bakvagnen genar kraftigt i innerkurvan medan bakänden kan svepa ut långt i ytterkurvan, vilket kräver extra bred svängbåge",
      "Fordonet följer precis samma spår som en vanlig personbil",
      "Manöverdugligheten ökar och fordonet behöver mindre utrymme"
    ],
    correct: 1,
    explanation: "Ett långt ledat fordon eller en buss med tungt släp kräver stor uppmärksamhet vid svängar då bakvagnen genar och kan ta i trottoarkanter eller hindra mötande trafik."
  }
];

export const TRAKTOR_QUESTIONS: Question[] = [
  {
    id: 1101,
    categoryId: 4,
    scene: "tractor",
    question: "Vilken är den högsta tillåtna konstruktionshastigheten för en Traktor a respektive en Traktor b?",
    options: [
      "Traktor a: 20 km/h, Traktor b: 40 km/h",
      "Traktor a: 40 km/h, Traktor b: 50 km/h",
      "Traktor a: 30 km/h, Traktor b: 50 km/h (men får köras i högst 40 km/h på allmän väg)",
      "Traktor a: 45 km/h, Traktor b: 80 km/h"
    ],
    correct: 2,
    explanation: "Traktor a är konstruerad för en hastighet av högst 30 km/h. Traktor b är konstruerad för en hastighet över 30 km/h men högst 50 km/h (på allmän väg får den dock framföras i max 40 km/h)."
  },
  {
    id: 1102,
    categoryId: 4,
    sign: { type: "lgf" },
    question: "Vad innebär denna orange-röda trekantiga skylt monterad bak på ett fordon?",
    options: [
      "Att fordonet bär miljöfarligt avfall",
      "Att det är ett Långsamtgående Fordon (LGF) som är konstruerat för en hastighet av högst 40 eller 45 km/h",
      "Att fordonet tillhör räddningstjänsten",
      "Att vägarbete pågår och man ska passera till vänster"
    ],
    correct: 1,
    explanation: "LGF-skylten (Långsamtgående Fordon) måste finnas bak på traktorer, motorredskap, tunga terrängvagnar samt släpfordon som dras av dessa."
  }
];

export const ALL_MOCK_QUESTIONS: Question[] = [
  ...B_PERSONBIL_QUESTIONS,
  ...AM_MOPED_QUESTIONS,
  ...HEAVY_QUESTIONS,
  ...YKB_QUESTIONS,
  ...A_MOTORCYKEL_QUESTIONS,
  ...BE_SLAP_QUESTIONS,
  ...C_LASTBIL_QUESTIONS,
  ...CE_SLAP_QUESTIONS,
  ...D_BUSS_QUESTIONS,
  ...DE_SLAP_QUESTIONS,
  ...TRAKTOR_QUESTIONS
];

// Procedural Builder for 15, 20, 45, 55 or 65 realistic test questions
export function buildTestQuestions(testId: string, customQuestions?: Question[], seed?: string): Question[] {
  let pool: Question[] = [];
  
  if (testId === 'B_STANDARD') {
    pool = [...B_PERSONBIL_QUESTIONS];
  } else if (testId === 'AM_STANDARD') {
    pool = [...AM_MOPED_QUESTIONS];
    // Pad with general rules from B
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 4 || q.categoryId === 3)];
  } else if (testId === 'A_STANDARD') {
    pool = [...A_MOTORCYKEL_QUESTIONS];
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 4 || q.categoryId === 3)];
  } else if (testId === 'BE_STANDARD') {
    pool = [...BE_SLAP_QUESTIONS];
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 1 || q.categoryId === 4)];
  } else if (testId === 'C_STANDARD' || testId === 'HEAVY_STANDARD') {
    pool = [...C_LASTBIL_QUESTIONS];
    pool = [...pool, ...HEAVY_QUESTIONS];
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 1 || q.categoryId === 4)];
  } else if (testId === 'CE_STANDARD') {
    pool = [...CE_SLAP_QUESTIONS];
    pool = [...pool, ...C_LASTBIL_QUESTIONS, ...HEAVY_QUESTIONS];
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 1 || q.categoryId === 4)];
  } else if (testId === 'D_STANDARD') {
    pool = [...D_BUSS_QUESTIONS];
    pool = [...pool, ...HEAVY_QUESTIONS];
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 1 || q.categoryId === 4)];
  } else if (testId === 'DE_STANDARD') {
    pool = [...DE_SLAP_QUESTIONS];
    pool = [...pool, ...D_BUSS_QUESTIONS, ...HEAVY_QUESTIONS];
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 1 || q.categoryId === 4)];
  } else if (testId === 'TRAKTOR_STANDARD') {
    pool = [...TRAKTOR_QUESTIONS];
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 4 || q.categoryId === 3)];
  } else if (testId === 'YKB_STANDARD') {
    pool = [...YKB_QUESTIONS];
    pool = [...pool, ...B_PERSONBIL_QUESTIONS.filter(q => q.categoryId === 3 || q.categoryId === 5)];
  } else {
    // Default / Focus / Snabbtest
    pool = [...B_PERSONBIL_QUESTIONS, ...AM_MOPED_QUESTIONS];
  }

  // Prepend custom questions if any
  if (customQuestions && customQuestions.length > 0) {
    pool = [...customQuestions, ...pool];
  }

  // De-duplicate
  const seen = new Set<number>();
  const unique: Question[] = [];
  for (const q of pool) {
    if (!seen.has(q.id)) {
      seen.add(q.id);
      unique.push(q);
    }
  }

  // Determine target count
  let target = 65;
  if (['BE_STANDARD', 'C_STANDARD', 'CE_STANDARD', 'D_STANDARD', 'DE_STANDARD', 'HEAVY_STANDARD'].includes(testId)) {
    target = 55;
  } else if (testId === 'TRAKTOR_STANDARD') {
    target = 45;
  } else if (['TRAFIKREGLER_FOCUS', 'MILJO_SÄKERHET_FOCUS'].includes(testId)) {
    target = 20;
  } else if (testId === 'QUICK_PRACTICE') {
    target = 15;
  }

  // Seeded / pseudo-random pseudo-shuffle helper
  const shuffleWithSeed = <T>(array: T[], seedStr: string): T[] => {
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed << 5) - seed + seedStr.charCodeAt(i);
      seed |= 0;
    }
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // If seed provided or random, shuffle pool per category for authentic Trafikverket balance
  const effectiveSeed = seed || `${testId}_${Date.now()}_${Math.random()}`;
  
  // Group by category to preserve official Swedish Trafikverket question distribution:
  // Cat 1: Fordonskännedom, Cat 2: Miljö, Cat 3: Trafiksäkerhet, Cat 4: Trafikregler, Cat 5: Personliga förutsättningar
  const categories: Record<number, Question[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  unique.forEach(q => {
    const cat = (q.categoryId >= 1 && q.categoryId <= 5) ? q.categoryId : 4;
    categories[cat].push(q);
  });

  // Shuffle within each category using seed
  Object.keys(categories).forEach(catKey => {
    const k = Number(catKey);
    categories[k] = shuffleWithSeed(categories[k], `${effectiveSeed}_cat_${k}`);
  });

  // Interleave questions to form balanced exam
  const balancedSelection: Question[] = [];
  let maxPerCat = Math.max(...Object.values(categories).map(c => c.length));
  for (let i = 0; i < maxPerCat; i++) {
    [4, 3, 1, 2, 5, 4].forEach(catNum => {
      if (categories[catNum] && categories[catNum][i]) {
        balancedSelection.push(categories[catNum][i]);
      }
    });
  }

  // Fallback to all shuffled unique if selection is smaller than target
  const finalCandidates = balancedSelection.length >= target ? balancedSelection : shuffleWithSeed(unique, effectiveSeed);
  
  const result: Question[] = [];
  const chosenIds = new Set<number>();

  for (const q of finalCandidates) {
    if (!chosenIds.has(q.id)) {
      chosenIds.add(q.id);
      result.push(q);
      if (result.length >= target) break;
    }
  }

  // In the rare case target is larger than pool, pad with variations
  let copyIndex = 0;
  while (result.length < target && unique.length > 0) {
    const qToCopy = unique[copyIndex % unique.length];
    result.push({
      ...qToCopy,
      id: 30000 + result.length,
      question: qToCopy.question + " (Repetition)"
    });
    copyIndex++;
  }

  return result.slice(0, target);
}
