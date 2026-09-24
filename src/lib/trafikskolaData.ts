export interface TrafikskolaVehicle {
  id: string;
  regNr: string;
  model: string;
  type: 'Automat' | 'Manuell';
  licenseCategory: 'B' | 'BE' | 'C' | 'CE' | 'D' | 'A';
  year: number;
}

export interface TrafikskolaProfile {
  name: string;
  slogan: string;
  strNumber: string;
  orgNumber: string;
  utbildningsledare: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  vehicles: TrafikskolaVehicle[];
}

export interface OvadeMomentEntry {
  momentNr: number;
  momentTitel: string;
  category: string;
  niva: 1 | 2 | 3; // 1: Visat/Instruktion, 2: Övad med stöd, 3: Självständig/Godkänd
  kommentar?: string;
}

export interface LektionsProtokoll {
  id: string;
  lektionNr: number;
  elevId: string;
  elevNamn: string;
  personalNumber: string;
  datum: string;
  tid: string;
  langdMinuter: number; // 40, 50, 80 etc.
  fordon: string;
  larare: string;
  lektionstyp: 'Grundövning' | 'Stadstrafik & Samspel' | 'Landsväg & Högre fart' | 'Motorväg & Omkörning' | 'Mörker & Halka' | 'Provsimulering';
  ovadeMoment: OvadeMomentEntry[];
  styrkor: string;
  utvecklingsomraden: string;
  radHandledare: string;
  betygHelhet: 'Bra genomfört' | 'Godkänd nivå' | 'Behöver mer träning' | string;
  nastaLektionRekommendation: string;
  createdAt: string;
}

export interface Utbildningskontroll {
  id: string;
  elevId: string;
  elevNamn: string;
  personalNumber: string;
  datum: string;
  larare: string;
  fordon: string;
  sakerhetskontroll: 'Godkänd' | 'Bristfällig';
  manavrering: 'Godkänd' | 'Bristfällig';
  stadstrafik: 'Godkänd' | 'Bristfällig';
  landsvag: 'Godkänd' | 'Bristfällig';
  beslut: 'Klar för Trafikverkets körprov' | 'Rekommenderas 1-2 lektioner till' | 'Omfattande träning krävs';
  kommentar: string;
  createdAt: string;
}

// Fiktiv officiell trafikskola: Svea Trafikakademi AB
export const DEFAULT_TRAFIKSKOLA: TrafikskolaProfile = {
  name: 'Svea Trafikakademi AB',
  slogan: 'Auktoriserad trafikutbildning i Västerås sedan 1998',
  strNumber: 'STR-8492-SE',
  orgNumber: '556812-4921',
  utbildningsledare: 'Rasmus Lundin (Leg. Trafiklärare)',
  address: 'Storgatan 24',
  city: '722 12 Västerås',
  phone: '021-14 80 00',
  email: 'info@sveatrafikakademi.se',
  website: 'www.sveatrafikakademi.se',
  vehicles: [
    { id: 'v1', regNr: 'SVE 01A', model: 'Volvo XC40 Recharge Electric', type: 'Automat', licenseCategory: 'B', year: 2024 },
    { id: 'v2', regNr: 'SVE 02M', model: 'Volkswagen Golf 2.0 TDI R-Line', type: 'Manuell', licenseCategory: 'B', year: 2023 },
    { id: 'v3', regNr: 'SVE 03M', model: 'BMW 118i M-Sport', type: 'Manuell', licenseCategory: 'B', year: 2023 },
    { id: 'v4', regNr: 'TNG 888', model: 'Scania R450 Streamline Lastbil', type: 'Automat', licenseCategory: 'C', year: 2022 },
    { id: 'v5', regNr: 'TNG 999', model: 'Volvo FH16 540 Dragbil + Släp', type: 'Automat', licenseCategory: 'CE', year: 2023 },
    { id: 'v6', regNr: 'MC 07A', model: 'Yamaha MT-07 ABS', type: 'Manuell', licenseCategory: 'A', year: 2024 }
  ]
};

// Initiala förifyllda lektionsprotokoll för fiktiva skolan
export const INITIAL_LEKTIONS_PROTOKOLL: LektionsProtokoll[] = [
  {
    id: 'lek-101',
    lektionNr: 8,
    elevId: 'elev-emma',
    elevNamn: 'Emma Lindqvist',
    personalNumber: '20040512-1422',
    datum: '2026-09-22',
    tid: '13:30',
    langdMinuter: 80,
    fordon: 'Volkswagen Golf 2.0 TDI (SVE 02M)',
    larare: 'Rasmus Lundin',
    lektionstyp: 'Stadstrafik & Samspel',
    ovadeMoment: [
      { momentNr: 6, momentTitel: 'Mindre bostadsområden & Högerregeln', category: 'Trafikmiljö', niva: 3, kommentar: 'Bra avsökning i skymda korsningar.' },
      { momentNr: 7, momentTitel: 'Trafikljus & Cirkulationsplatser', category: 'Trafikmiljö', niva: 2, kommentar: 'Bra placering. Kom ihåg högerblinkers i god tid före utfart.' },
      { momentNr: 3, momentTitel: 'Växling & Ecodriving', category: 'Manövrering', niva: 3, kommentar: 'Bra motorbroms och mjuk nedväxling.' }
    ],
    styrkor: 'Lugn i bilen, bra rörlig blick och mjuk körning.',
    utvecklingsomraden: 'Blinka till höger i god tid före utfart ur flerspåriga cirkulationsplatser.',
    radHandledare: 'Öva i helgen på cirkulationsplatser med två körfält. Fokusera på tidig högerblinkers och spegel-döda vinkeln.',
    betygHelhet: 'Godkänd nivå',
    nastaLektionRekommendation: 'Lektion 9: Landsväg, hastighetsanpassning och omkörningar.',
    createdAt: '2026-09-22T14:50:00.000Z'
  },
  {
    id: 'lek-102',
    lektionNr: 3,
    elevId: 'elev-lucas',
    elevNamn: 'Lucas Bergström',
    personalNumber: '20050819-3891',
    datum: '2026-09-23',
    tid: '10:00',
    langdMinuter: 50,
    fordon: 'Volvo XC40 Recharge Electric (SVE 01A)',
    larare: 'Rasmus Lundin',
    lektionstyp: 'Grundövning',
    ovadeMoment: [
      { momentNr: 1, momentTitel: 'Körställning & Reglage', category: 'Körställning', niva: 3, kommentar: 'Stol, speglar och bälte sitter bra.' },
      { momentNr: 2, momentTitel: 'Gas & Broms (Krypkörning)', category: 'Manövrering', niva: 3, kommentar: 'Mjuk dosering på pedalen.' },
      { momentNr: 4, momentTitel: 'Backning & Parkering', category: 'Manövrering', niva: 2, kommentar: 'Bra referenspunkter, men titta mer bakåt genom rutan.' }
    ],
    styrkor: 'Hittade dragläget snabbt och manövrerar mjukt.',
    utvecklingsomraden: 'Vrid på huvudet och titta bakåt under backning istället för att enbart titta på skärmen.',
    radHandledare: 'Träna på rak backning längs trottoarkant och backning runt hörn på lugn villagata.',
    betygHelhet: 'Godkänd nivå',
    nastaLektionRekommendation: 'Lektion 4: Enklare villatrafik och högerregeln.',
    createdAt: '2026-09-23T10:55:00.000Z'
  },
  {
    id: 'lek-103',
    lektionNr: 12,
    elevId: 'elev-sofia',
    elevNamn: 'Sofia Al-Mansoor',
    personalNumber: '20031104-5820',
    datum: '2026-09-24',
    tid: '09:00',
    langdMinuter: 80,
    fordon: 'Volkswagen Golf 2.0 TDI (SVE 02M)',
    larare: 'Rasmus Lundin',
    lektionstyp: 'Provsimulering',
    ovadeMoment: [
      { momentNr: 5, momentTitel: 'Säkerhetskontroll (Inre & Yttre)', category: 'Körställning', niva: 3, kommentar: 'Genomförde fullständig inre och yttre kontroll utan problem.' },
      { momentNr: 11, momentTitel: 'Självständig körning mot mål', category: 'Självständig körning', niva: 3, kommentar: 'Följde vägvisning mot centrum säkert.' },
      { momentNr: 7, momentTitel: 'Trafikljus & Cirkulationsplatser', category: 'Trafikmiljö', niva: 3, kommentar: 'Bra placering och planering.' }
    ],
    styrkor: 'Självständig och trygg körning med goda marginaler och bra samspel.',
    utvecklingsomraden: 'Inga direkta brister. Redo för förarprovet.',
    radHandledare: 'Underhåll körningen med mängdträning hemma fram till provdagen.',
    betygHelhet: 'Bra genomfört',
    nastaLektionRekommendation: 'Körprov bokat hos Trafikverket. Skolan utfärdar godkänt utbildningsintyg.',
    createdAt: '2026-09-24T10:25:00.000Z'
  }
];

// Helper functions för LocalStorage
export function getTrafikskolaProfile(): TrafikskolaProfile {
  const saved = localStorage.getItem('svea_trafikskola_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  return DEFAULT_TRAFIKSKOLA;
}

export function saveTrafikskolaProfile(profile: TrafikskolaProfile): void {
  localStorage.setItem('svea_trafikskola_profile', JSON.stringify(profile));
}

export function getLektionsProtokollList(): LektionsProtokoll[] {
  const saved = localStorage.getItem('svea_lektions_protokoll');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  // Spara default för framtida bruk
  localStorage.setItem('svea_lektions_protokoll', JSON.stringify(INITIAL_LEKTIONS_PROTOKOLL));
  return INITIAL_LEKTIONS_PROTOKOLL;
}

export function saveLektionsProtokoll(protokoll: LektionsProtokoll): void {
  const list = getLektionsProtokollList();
  const existingIndex = list.findIndex(p => p.id === protokoll.id);
  let updated: LektionsProtokoll[];
  if (existingIndex >= 0) {
    updated = [...list];
    updated[existingIndex] = protokoll;
  } else {
    updated = [protokoll, ...list];
  }
  localStorage.setItem('svea_lektions_protokoll', JSON.stringify(updated));
}

export function deleteLektionsProtokoll(id: string): void {
  const list = getLektionsProtokollList();
  const updated = list.filter(p => p.id !== id);
  localStorage.setItem('svea_lektions_protokoll', JSON.stringify(updated));
}
