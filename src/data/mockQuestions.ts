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
      "Du har stopplikt och muste alltid stanna innan du kör vidare",
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
    explanation: "Genom att dra i ratten (belasta styrsystemet) innan du startar motorn, och sedan starta, känner du tydligt när servon slår igång eftersom ratten plötsligt blir mycket lättare å ratta."
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
      "Ett bränsleadditiv som ökar motorns hstkrafter med 20%"
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
  }
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
    question: "Varför har en släpvagn till en tung lastbil en så kallad 'katastrofventil' (avbnytningsventil) på tryckluftsslangen?",
    options: [
      "För att tömma däcken på luft om fordonet välter",
      "För att omedelbart katastrofbromsa släpet automatiskt om det skulle lossna från dragbilen under körning",
      "För att kyla ner bromsarna i extremt långa nedförsbackar",
      "För att föraren ska kunna släppa ut kondensvatten från hytten"
    ],
    correct: 1,
    explanation: "Katastrofventilen ser till att släpets bromsar låser sig direkt om de röda tryckluftsslangarna slits av (t.ex. om släpet kopplas loss oavsiktligt under färd)."
  }
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
export function buildTestQuestions(testId: string, customQuestions?: Question[]): Question[] {
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

  // Pad using copies if short
  const result = [...unique];
  while (result.length < target && unique.length > 0) {
    const qToCopy = unique[result.length % unique.length];
    result.push({
      ...qToCopy,
      id: 30000 + result.length,
      question: qToCopy.question + " (Repetitionsanalys)"
    });
  }

  return result.slice(0, target);
}
