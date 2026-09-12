export interface LicenseGuideItem {
  license: string;
  name: string;
  category: 'bil' | 'slap' | 'lastbil' | 'buss' | 'mc' | 'yrke' | 'spar';
  driveTime: string;
  mandatoryHighlights: string[];
  safetyCheck: {
    title: string;
    description: string;
    items: string[];
  };
  maneuverItems: string[];
  trafficItems: string[];
  notes?: string[];
}

export const LICENSE_GUIDES: Record<string, LicenseGuideItem> = {
  B: {
    license: 'B',
    name: 'Personbil & Lätt lastbil',
    category: 'bil',
    driveTime: 'Minst 25 minuter ren körning i trafik (tid för säkerhetskontroll och särskilt manöverprov räknas inte in). Fördelning: 10–20 min i tätort, 10–20 min landsväg.',
    mandatoryHighlights: [
      'Minst 2 särskilda manöverprov MÅSTE genomföras, varav ett OBLIGATORISKT ska vara Backning.',
      'Effektiv kraftig inbromsning från minst 50 km/h till stillastående.',
      'Självständig körning mot mål / färdväg.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll B',
      description: 'En eller flera delar ges i uppgift. Kandidaten utför kontrollen praktiskt och föreslår åtgärder vid brister.',
      items: [
        'Däck och fälg (mönsterdjup min 1,6 mm sommar / 3 mm vinter, skador, lufttryck)',
        'Belysning, reflexer och blinkers',
        'Vindrutetorkare och spolare',
        'Vätskor under motorhuv (spolarvätska, kylarvätska, bromsvätska, motorolja)',
        'Styrning och servofunktion',
        'Färdbroms, parkeringsbroms och bromsservo (trampa ner och starta motor)',
        'Signalhorn, rutor och backspeglar'
      ]
    },
    maneuverItems: [
      'Backning (Obligatoriskt! Runt hörn eller mellan fordon med rakbackning före/efter)',
      'Parkering (Fickparkering, infart/backning i ruta)',
      'Start i lutning / Vändning (Kopplingskontroll/rullningsfrihet)'
    ],
    trafficItems: [
      'Korsningar och signalreglering',
      'Cirkulationsplatser (filval, avsökning, tecken)',
      'Oskyddade trafikanter (övergångsställen, cykelpassager)',
      'Landsvägskörning & Sväng från landsväg (avstånd, planering)',
      'Omkörning och möte på smal/krokig väg'
    ],
    notes: [
      'Om körtiden understiger 25 min pga låg färdighet underkänns provet.',
      'Vid underkännande anges grundorsak (kompetensområde) och situationer.'
    ]
  },

  B96: {
    license: 'B96',
    name: 'Utökad B (Kombination max 4 250 kg)',
    category: 'slap',
    driveTime: 'Minst 45 minuter (varav minst 30 minuter körning i trafik).',
    mandatoryHighlights: [
      'Säkerhetskontroll släp & fordon.',
      'Sammankoppling & isärkoppling (mekanisk koppling, katastrofbromswire, el, stödhjul).',
      'Backning med samtidig svängning med släp.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll & Släp B96',
      description: 'Samma 19 officiella moment som för behörighet BE.',
      items: [
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
      ]
    },
    maneuverItems: [
      'Sammankoppling och isärkoppling',
      'Backning med samtidig svängning (t.ex. runt hörn eller in i trång passage)'
    ],
    trafficItems: [
      'Körning i tätort med släpkombination',
      'Körning på landsväg/motorväg med hänsyn till släpets spårning och längd'
    ]
  },

  BE: {
    license: 'BE',
    name: 'Personbil med tungt släp (Släp max 3 500 kg)',
    category: 'slap',
    driveTime: 'Minst 45 minuter (varav minst 30 minuter i trafik).',
    mandatoryHighlights: [
      'Samtliga 19 säkerhetskontrollmoment genomförs systematiskt.',
      'Sammankoppling och isärkoppling av släpvagn på säkert och rutinerat sätt.',
      'Backning med samtidigt svängande manöver med släpfordon.',
      'Redogörelse för vikter via registreringsbevis (lastvikt, tågvikt, kultryck).'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll BE (19 Officiella Moment)',
      description: 'Systematisk och noggrann kontroll av dragbil och släpfordon:',
      items: [
        'Dörrar',
        'Sammankoppling',
        'Blinkers',
        'Systematisk kontroll',
        'Vindrutetorkare och spolare',
        'Last (säkring, placering, spännband/låsning)',
        'Bromsar på släpfordon (påskjutsbroms, funktion)',
        'Belysning (positionsljus, halvljus, bakljus, skyltlykta)',
        'Däck och fälg (mönster, skador, bultar på båda fordon)',
        'Reflexer (triangulära bak på släp, sidoreflexer)',
        'Bromsar på dragfordon',
        'Vätskor',
        'Rutor',
        'Backspeglar (extra backspeglar vid brett släp)',
        'Styrning',
        'Varningssystem',
        'Signalhorn',
        'Katastrofbromswire (korrekt fästning och skick)',
        'Kopplingsanordning (kulhandske, låsindikering, sprint)'
      ]
    },
    maneuverItems: [
      'Sammankoppling och isärkoppling i rätt ordningsföljd',
      'Backning med svängning (runt hörn eller mot angiven lastyta)',
      'Kontrollprov efter sammankoppling (dragprov)'
    ],
    trafficItems: [
      'Trafikkörning i tätort, rondeller och korsningar (anpassad spårning)',
      'Trafikkörning på landsväg (hastighetsbegränsning 80 km/h, stabilitet, omkörningar)'
    ],
    notes: [
      'Om säkerhetskontroll underkänns men körningen är godkänd tillgodoräknas körningen.',
      'Vid omprov säkerhetskontroll genomförs enbart de 19 säkerhetsmomenten och provtyp benämns "Säkerhetskontroll BE".'
    ]
  },

  C: {
    license: 'C',
    name: 'Tung lastbil',
    category: 'lastbil',
    driveTime: 'Minst 45 minuter effektiv körning i varierad trafikmiljö.',
    mandatoryHighlights: [
      'Fullständig säkerhetskontroll & funktionsbeskrivning (inkl. provtryckning & täthetsprov av tryckluft).',
      'Hantering av digital färdskrivare (förarkort, manuell inmatning, utskrift).',
      'Backning med svängning runt hörn/hinder.',
      'Stanna för lastning/lossning vid lastramp eller brygga.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll C (Lastbil)',
      description: 'Systematisk kontroll och muntlig funktionsbeskrivning:',
      items: [
        'Tryckluftssystem (provtryckning, täthetsprov, spärrventil, varningssignal)',
        'Färdbroms, parkeringsbroms och hjälpbroms (retarder/avgasbroms)',
        'Däck, fälg och hjulbultar (kontroll av åtdragning och skador)',
        'Styrsystem och framvagn',
        'Digital färdskrivare (inmatning av vilotid, klocka, utskriftsfunktion)',
        'Last och lastsäkring (surrningar, spännband, lastberäkning)',
        'Vätskor under motorhuv / hytt',
        'Rutor, backspeglar och kamerasystem',
        'Belysning, reflexer och varningssystem'
      ]
    },
    maneuverItems: [
      'Backning med samtidig svängning runt hörn',
      'Stanna säkert för lastning och lossning (lastramp/brygga)'
    ],
    trafficItems: [
      'Körning i tätort (döda vinklar, överhäng, refuger, cyklister)',
      'Landsväg och motorväg (hastighetsanpassning för tung lastbil, avstånd)',
      'Ekokörning / EcoDriving med tungt fordon'
    ],
    notes: [
      'Vid underkänd säkerhetskontroll men godkänd körning tillgodoräknas körningen i 1 år.',
      'Omprov kallas "Säkerhetskontroll C" och ger "Behörighet uppnådd: C" vid godkänt.'
    ]
  },

  C1: {
    license: 'C1',
    name: 'Medeltung lastbil (max 7 500 kg)',
    category: 'lastbil',
    driveTime: 'Minst 45 minuter ren körning.',
    mandatoryHighlights: [
      'Säkerhetskontroll och funktionsbeskrivning.',
      'Manöverprov: Backning med sväng samt stanna vid lastramp/brygga.',
      'Färdskrivarhantering om fordonet omfattas av kör- och vilotider.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll C1',
      description: 'Samma omfattning som C anpassat för fordon upp till 7,5 ton.',
      items: [
        'Bromssystem och hydraulik/tryckluft',
        'Hjul, däck och bultar',
        'Färdskrivare (om monterad)',
        'Last och lastsäkring',
        'Styrning, vätskor, sikt och belysning'
      ]
    },
    maneuverItems: [
      'Backning med svängning',
      'Stanna för lastning/lossning vid ramp/brygga'
    ],
    trafficItems: [
      'Trafikkörning i tätort och landsväg'
    ]
  },

  CE: {
    license: 'CE',
    name: 'Tung lastbil med tungt släp (Kombination)',
    category: 'lastbil',
    driveTime: 'Minst 45 minuter i trafik.',
    mandatoryHighlights: [
      'Sammankoppling och isärkoppling (mekanisk koppling, luftslangar, elkoppling, kontrollprov).',
      'Fullständig säkerhetskontroll av både dragbil och släpvagn/semitrailer.',
      'Backning längs en böjd linje (S-kurva eller vinkelsväng).',
      'Backning mot lastkaj/brygga med släpekipaget.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll CE (Dragbil + Släp)',
      description: 'Fullständig fordonskontroll för hela kombinationen:',
      items: [
        'Kopplingsanordning (vändskiva/dragstång, spärrar, slitage)',
        'Broms- och elanslutningar (duomatic/standardluftslangar, ABS/EBS-kabel)',
        'Bromsar på släpfordon och dragbil (provtryckning och spärrventil)',
        'Katastrofbroms och parkeringsbroms på släp',
        'Däck, fälg och hjulbultar på alla axlar',
        'Färdskrivare och färdskrivarhantering',
        'Last, spännband och lastfördelning över axlar',
        'Underkörningsskydd, stänkskydd och belysning'
      ]
    },
    maneuverItems: [
      'Sammankoppling och isärkoppling',
      'Backning med samtidig svängning med kombinationen',
      'Stanna mot lastramp/brygga'
    ],
    trafficItems: [
      'Planering av spårning i cirkulationsplatser och snäva svängar',
      'Hastighetsanpassning, retardationsplanering och ekokörning',
      'Motorväg och landsvägskörning med full fordonslängd (upp till 25,25 m)'
    ]
  },

  C1E: {
    license: 'C1E',
    name: 'Medeltung lastbil med släp',
    category: 'lastbil',
    driveTime: 'Minst 45 minuter.',
    mandatoryHighlights: [
      'Sammankoppling och isärkoppling.',
      'Säkerhetskontroll för bil och släp.',
      'Backning med sväng och rampstopp.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll C1E',
      description: 'Kontroll av C1-fordon plus släpvagn.',
      items: [
        'Kopplingsanordning och kablage',
        'Broms- och belysningskontroll',
        'Däck på samtliga axlar',
        'Last och surrning'
      ]
    },
    maneuverItems: [
      'Sammankoppling och isärkoppling',
      'Backning med svängning'
    ],
    trafficItems: [
      'Körning i varierad trafikmiljö'
    ]
  },

  D: {
    license: 'D',
    name: 'Buss (Persontransport)',
    category: 'buss',
    driveTime: 'Minst 45 minuter körning i trafik.',
    mandatoryHighlights: [
      'Säkerhetskontroll med fokus på passagerarsäkerhet, nödöppning och brandskydd.',
      'Mjuk, passageraranpassad körning (stående resenärer).',
      'Infart och utfart från busshållplatser.',
      'Backning med svängning.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll D (Buss)',
      description: 'Kontroll av bussen med särskild inriktning på passagerarsäkerhet:',
      items: [
        'Dörrautomatik, klämskydd och nödöppningsventiler (inre och yttre)',
        'Nödutgångar, takluckor och nödhammare',
        'Brandsläckare och förbandslåda',
        'Tryckluftssystem och bromsar (provtryckning, färd- och p-broms)',
        'Färdskrivare och förarkort',
        'Däck, fälgar och hjulbultar',
        'Belysning, varningsblinkers och skyltning',
        'Backspeglar och passagerarkameror/innerspeglar'
      ]
    },
    maneuverItems: [
      'Backning med samtidig svängning',
      'Precisionsstopp vid hållplatskant/trottoar'
    ],
    trafficItems: [
      'Passagerarvänlig acceleration och inbromsning',
      'Infart/utfart vid busshållplats (blinkersrutiner och företrädesregler)',
      'Körning i trång stadstrafik med överhäng fram och bak'
    ]
  },

  DE: {
    license: 'DE',
    name: 'Buss med tungt släp',
    category: 'buss',
    driveTime: 'Minst 45 minuter i trafik.',
    mandatoryHighlights: [
      'Sammankoppling och isärkoppling av släp.',
      'Säkerhetskontroll av buss + släp.',
      'Passageraranpassad körning och hållplatsrutiner med släp.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll DE',
      description: 'Full busskontroll plus släpvagnsmoment.',
      items: [
        'Busssäkerhet (dörrar, nödutgångar, brandsläckare)',
        'Kopplingsanordning, broms- och elanslutning till släp',
        'Tryckluft och bromskontroll på båda fordonen'
      ]
    },
    maneuverItems: [
      'Sammankoppling och isärkoppling',
      'Backning med svängning med buss och släp'
    ],
    trafficItems: [
      'Trafikkörning med passagerare och släpvagn'
    ]
  },

  A: {
    license: 'A',
    name: 'Tung motorcykel (samt A1 & A2)',
    category: 'mc',
    driveTime: 'Minst 25 minuter körning i trafik (efter genomfört och godkänt manöverprov på bana).',
    mandatoryHighlights: [
      'Säkerhetskontroll motorcykel.',
      'Manöverprov bana: Lågfartsbana (balans & krypfart).',
      'Manöverprov bana: Högfartsbana (slalom och undanmanöver i 50 km/h).',
      'Bromsprov från 70 km/h och 90 km/h till stillastående.'
    ],
    safetyCheck: {
      title: 'Säkerhetskontroll Motorcykel',
      description: 'Systematisk genomgång av motorcykelns vitala delar:',
      items: [
        'Bromssystem (fram- och bakbroms, tryckpunkt, bromsvätska, belägg)',
        'Däck och fälg (mönsterdjup min 1 mm, lufttryck, sprickor, ekrar)',
        'Drivpaket (kedjespänning, smörjning, drevslitage)',
        'Styrlager och framgaffel (inget glapp, inga oljeläckage på gaffelben)',
        'Belysning, reflexer, blinkers och tuta',
        'Nödstoppskontakt och stödkontakt'
      ]
    },
    maneuverItems: [
      'Lågfartsbana (krypkörning med dragläge)',
      'Högfartsbana i 50 km/h (styrning och motstyrning)',
      'Effektiv inbromsning från 70 och 90 km/h'
    ],
    trafficItems: [
      'Aktivt spårval och placering för maximal sikt och säkerhet',
      'Kurvteknik (fartminskning, blick och nedlägg)',
      'Avsökning och döda vinkeln'
    ]
  },

  TAXI: {
    license: 'TAXI',
    name: 'Taxiförarprov (Körprov)',
    category: 'yrke',
    driveTime: 'Ca 30–40 minuter.',
    mandatoryHighlights: [
      'Fordonskontroll och säkerhetsutrustning i taxi.',
      'Adressökning / Navigering via GPS eller karta.',
      'Kundservice och passagerarvänlig, behaglig körning.'
    ],
    safetyCheck: {
      title: 'Fordonskontroll Taxi',
      description: 'Enligt taxitrafiklagen (2012:211):',
      items: [
        'Säkerhetsbälten på samtliga platser',
        'Dörrlås och barnsäkerhetsspärrar',
        'Bagageutrymme och säker förvaring av bagage',
        'Belysning och renlighet',
        'Eventuell barnbilstol / bälteskudde'
      ]
    },
    maneuverItems: [
      'Manövrering i trånga utrymmen',
      'Stannande vid trottoar för säker på- och avstigning'
    ],
    trafficItems: [
      'Mjuk, behaglig passagerarkörning',
      'Självständig navigering mot uppgiven adress',
      'Trafikregler och hastighetsefterlevnad'
    ]
  }
};
