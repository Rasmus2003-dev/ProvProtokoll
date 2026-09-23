// Förslag på uppgifter vid säkerhetskontroll: personbil (B, B1, B96, taxi),
// motorcykel/moped (A, A1, A2, AM) och personbil med släp (BE).
// Kandidaten utför kontrollen praktiskt och föreslår åtgärd vid brist.
// Varje prov får nya slumpade uppgifter.

export type SafetyGroup = 'bil' | 'mc' | 'be';

export type LightSafetyArea =
  | 'Utvändigt' | 'Under motorhuven' | 'Förarplatsen'            // bil
  | 'Däck och bromsar' | 'Drivning och chassi' | 'Belysning och reglage' // mc
  | 'Alltid' | 'Urval';                                           // BE

export interface LightSafetyTask {
  id: string;
  group: SafetyGroup;
  area: LightSafetyArea;
  task: string;       // vad kandidaten ska kontrollera
  lookFor: string;    // vad inspektören lyssnar/tittar efter
}

const GROUP_BY_LICENSE: Record<string, SafetyGroup> = {
  B: 'bil', B1: 'bil', B96: 'bil', TAXI: 'bil',
  A: 'mc', A1: 'mc', A2: 'mc', AM: 'mc',
  BE: 'be',
};

export const LIGHT_SAFETY_LICENSES = Object.keys(GROUP_BY_LICENSE);

export function safetyGroupFor(license: string): SafetyGroup | null {
  return GROUP_BY_LICENSE[license] || null;
}

export const LIGHT_SAFETY_TASKS: LightSafetyTask[] = [
  // ── Personbil ──
  // Utvändigt
  { id: 'u-dack-monster', group: 'bil', area: 'Utvändigt', task: 'Kontrollera mönsterdjupet på ett däck', lookFor: 'Minst 1,6 mm sommar, 3 mm vinter (dec–mars). Visar med slitagevarnare eller mätare.' },
  { id: 'u-dack-skador', group: 'bil', area: 'Utvändigt', task: 'Kontrollera däckens skick', lookFor: 'Letar efter sprickor, bulor, skärskador och ojämnt slitage. Vet att skadat däck ska bytas.' },
  { id: 'u-lufttryck', group: 'bil', area: 'Utvändigt', task: 'Visa var rätt lufttryck står och hur det kontrolleras', lookFor: 'Dörrstolpe/tanklock/instruktionsbok. Kontrolleras med kalla däck.' },
  { id: 'u-halvljus', group: 'bil', area: 'Utvändigt', task: 'Kontrollera halvljuset', lookFor: 'Tänder och går runt bilen, eller kontrollerar mot vägg/reflex. Båda sidor.' },
  { id: 'u-bromsljus', group: 'bil', area: 'Utvändigt', task: 'Kontrollera bromsljusen', lookFor: 'Använder reflex i fönster/vägg eller ber om hjälp. Inklusive högt monterat bromsljus.' },
  { id: 'u-blinkers', group: 'bil', area: 'Utvändigt', task: 'Kontrollera körriktningsvisare och varningsblinkers', lookFor: 'Alla lampor fram, bak och på sidan. Snabbare blinkfrekvens = trasig lampa.' },
  { id: 'u-backljus', group: 'bil', area: 'Utvändigt', task: 'Kontrollera backljuset', lookFor: 'Tändning på, backväxel i, kontrollerar bakom bilen eller via reflex.' },
  { id: 'u-skylt', group: 'bil', area: 'Utvändigt', task: 'Kontrollera skyltbelysning och registreringsskyltar', lookFor: 'Skyltarna rena och läsbara, skyltbelysningen fungerar.' },
  { id: 'u-rutor', group: 'bil', area: 'Utvändigt', task: 'Kontrollera rutor och backspeglar', lookFor: 'Inga sprickor i siktfältet, rena rutor, hela och rätt inställda speglar.' },
  { id: 'u-torkare', group: 'bil', area: 'Utvändigt', task: 'Kontrollera torkarbladen', lookFor: 'Gummit helt och mjukt, inga ränder. Vet när bladen behöver bytas.' },

  // Under motorhuven
  { id: 'm-olja', group: 'bil', area: 'Under motorhuven', task: 'Kontrollera motoroljenivån', lookFor: 'Bil på plant underlag, motor avstängd en stund. Mätstickan mellan min och max.' },
  { id: 'm-kylarvatska', group: 'bil', area: 'Under motorhuven', task: 'Kontrollera kylarvätskenivån', lookFor: 'Nivå mellan min/max i expansionskärlet. Öppnar inte locket på varm motor.' },
  { id: 'm-bromsvatska', group: 'bil', area: 'Under motorhuven', task: 'Kontrollera bromsvätskenivån', lookFor: 'Nivå mellan min/max. Vet att låg nivå kan tyda på slitage eller läckage.' },
  { id: 'm-spolarvatska', group: 'bil', area: 'Under motorhuven', task: 'Kontrollera spolarvätskan', lookFor: 'Hittar behållaren, kontrollerar nivån. Vintertid frostskyddad vätska.' },
  { id: 'm-servo', group: 'bil', area: 'Under motorhuven', task: 'Visa var servooljan finns (om hydraulisk servo)', lookFor: 'Hittar behållaren eller vet att bilen har elektrisk servo.' },

  // Förarplatsen
  { id: 'f-fardbroms', group: 'bil', area: 'Förarplatsen', task: 'Kontrollera färdbromsen', lookFor: 'Pedalen fast, inte för lång pedalväg. Provbroms i låg fart.' },
  { id: 'f-bromsservo', group: 'bil', area: 'Förarplatsen', task: 'Kontrollera bromsservon', lookFor: 'Pumpar pedalen med motorn av, håller nedtryckt, startar – pedalen sjunker något.' },
  { id: 'f-parkeringsbroms', group: 'bil', area: 'Förarplatsen', task: 'Kontrollera parkeringsbromsen', lookFor: 'Håller bilen stilla, varningslampan tänds. Elektrisk broms: visar funktion.' },
  { id: 'f-styrservo', group: 'bil', area: 'Förarplatsen', task: 'Kontrollera styrning och styrservo', lookFor: 'Inget onormalt glapp, servon lättar när motorn startas.' },
  { id: 'f-signalhorn', group: 'bil', area: 'Förarplatsen', task: 'Kontrollera signalhornet', lookFor: 'Fungerar – används med hänsyn till omgivningen.' },
  { id: 'f-varningslampor', group: 'bil', area: 'Förarplatsen', task: 'Förklara varningslamporna i instrumentpanelen', lookFor: 'Känner igen röda (stanna) och gula (åtgärda snart) lampor, t.ex. oljetryck och broms.' },
  { id: 'f-defroster', group: 'bil', area: 'Förarplatsen', task: 'Visa hur rutorna hålls imfria', lookFor: 'Defroster, fläkt mot ruta, AC och bakrutevärme.' },
  { id: 'f-balten', group: 'bil', area: 'Förarplatsen', task: 'Kontrollera säkerhetsbältena', lookFor: 'Bältet låser vid ryck, inga skador på bandet, fungerande lås.' },
  { id: 'f-varningstriangel', group: 'bil', area: 'Förarplatsen', task: 'Visa var varningstriangeln finns och hur den används', lookFor: 'Hittar triangeln, vet att den ställs ut en bit bakom bilen vid stopp.' },

  // ── Motorcykel / moped (enligt rutinen för körprov A1, A2, A) ──
  // Däck och bromsar
  { id: 'mc-dack-monster', group: 'mc', area: 'Däck och bromsar', task: 'Kontrollera mönsterdjupet på däcken', lookFor: 'Minst 1 mm. Mäter eller visar slitagevarnare, både fram och bak.' },
  { id: 'mc-dack-skick', group: 'mc', area: 'Däck och bromsar', task: 'Kontrollera däckens skick och lufttryck', lookFor: 'Inga sprickor, bulor eller inbäddade föremål. Vet var rätt tryck står och kontrollerar kallt däck.' },
  { id: 'mc-frambroms', group: 'mc', area: 'Däck och bromsar', task: 'Kontrollera frambromsen', lookFor: 'Fast tryckpunkt i handtaget, inget läckage, provbromsar med hjulet rullande.' },
  { id: 'mc-bakbroms', group: 'mc', area: 'Däck och bromsar', task: 'Kontrollera bakbromsen', lookFor: 'Fast tryckpunkt i pedalen, lagom pedalväg, provbromsar.' },
  { id: 'mc-bromsvatska', group: 'mc', area: 'Däck och bromsar', task: 'Kontrollera bromsvätskenivån', lookFor: 'Hittar behållarna (styre/bak), nivån mellan min och max med MC:n upprätt. Vet att låg nivå kan betyda slitna belägg eller läckage.' },
  { id: 'mc-belagg', group: 'mc', area: 'Däck och bromsar', task: 'Visa hur bromsbeläggen kontrolleras', lookFor: 'Tittar in i oket, ser att det finns beläggmassa kvar till slitagemarkeringen.' },

  // Drivning och chassi
  { id: 'mc-kedja', group: 'mc', area: 'Drivning och chassi', task: 'Kontrollera kedjans spänning och smörjning', lookFor: 'Rätt spel enligt instruktionsbok/dekal, kedjan smord och inte rostig. Kardan/rem: vet hur den kontrolleras.' },
  { id: 'mc-drev', group: 'mc', area: 'Drivning och chassi', task: 'Kontrollera slitage på kedja och drev', lookFor: 'Kuggarna inte spetsiga eller krokiga, kedjan går inte att dra ut från drevet bak.' },
  { id: 'mc-styrlager', group: 'mc', area: 'Drivning och chassi', task: 'Kontrollera styrningen', lookFor: 'Styret går lätt åt båda håll, inget glapp i styrlagret (drar i gaffeln med frambromsen i).' },
  { id: 'mc-fjadring', group: 'mc', area: 'Drivning och chassi', task: 'Kontrollera fjädring och framgaffel', lookFor: 'Gaffeltätningarna läcker inte olja, fjädringen dämpar när man trycker ned och släpper.' },
  { id: 'mc-olja', group: 'mc', area: 'Drivning och chassi', task: 'Kontrollera motoroljenivån', lookFor: 'MC:n upprätt på plant underlag, nivån mellan min och max i fönster eller på mätsticka.' },

  // Belysning och reglage
  { id: 'mc-ljus', group: 'mc', area: 'Belysning och reglage', task: 'Kontrollera halvljus och helljus', lookFor: 'Båda fungerar, helljusindikeringen tänds. Vet att halvljus ska vara tänt vid färd.' },
  { id: 'mc-bromsljus', group: 'mc', area: 'Belysning och reglage', task: 'Kontrollera bromsljuset', lookFor: 'Tänds både med handbromsen och fotbromsen.' },
  { id: 'mc-blinkers', group: 'mc', area: 'Belysning och reglage', task: 'Kontrollera blinkersen', lookFor: 'Alla fyra fungerar, indikeringen på instrumentet blinkar.' },
  { id: 'mc-nodstopp', group: 'mc', area: 'Belysning och reglage', task: 'Visa nödstoppet och förklara när det används', lookFor: 'Hittar nödstoppsknappen, vet att den stänger av motorn t.ex. vid vurpa eller om gasen hänger sig.' },
  { id: 'mc-signalhorn', group: 'mc', area: 'Belysning och reglage', task: 'Kontrollera signalhornet', lookFor: 'Fungerar – används med hänsyn till omgivningen.' },
  { id: 'mc-speglar', group: 'mc', area: 'Belysning och reglage', task: 'Kontrollera backspeglarna', lookFor: 'Hela, rena och rätt inställda från körställning.' },

  // ── BE: dessa tre ska alltid ingå (även vid omprov) enligt rutinbeskrivningen ──
  { id: 'be-dorrar', group: 'be', area: 'Alltid', task: 'Kontrollera att dörrarna är stängda', lookFor: 'Går runt och kontrollerar bilens dörrar, bagagelucka och släpets lämmar/dörrar.' },
  { id: 'be-last', group: 'be', area: 'Alltid', task: 'Kontrollera lasten', lookFor: 'Säkring och placering (rätt kultryck), mängd enligt registreringsbevisen.' },
  { id: 'be-koppling', group: 'be', area: 'Alltid', task: 'Kontrollera kopplingsanordning, katastrofbromswire, bromsar och elanslutning', lookFor: 'Kulkopplingen låst (indikering), wiren rätt fäst, elkontakten i och fungerar, stödhjulet uppe, parkeringsbromsen på släpet lossad.' },

  // BE: urval – två slumpas utöver de tre ovan
  { id: 'be-belysning', group: 'be', area: 'Urval', task: 'Kontrollera belysningen på släpet', lookFor: 'Positionsljus, bromsljus, blinkers och skyltbelysning fungerar på släpet.' },
  { id: 'be-reflexer', group: 'be', area: 'Urval', task: 'Kontrollera reflexerna på släpet', lookFor: 'Röda triangulära reflexer bak och sidoreflexer, hela och rena.' },
  { id: 'be-dack', group: 'be', area: 'Urval', task: 'Kontrollera däck och fälg på släpet', lookFor: 'Mönsterdjup, skador och hjulbultar.' },
  { id: 'be-bromsslap', group: 'be', area: 'Urval', task: 'Förklara hur släpets bromsar fungerar', lookFor: 'Påskjutsbromsen och vad katastrofbromswiren gör om släpet lossnar.' },
  { id: 'be-bromsdrag', group: 'be', area: 'Urval', task: 'Kontrollera bromsarna på dragfordonet', lookFor: 'Fast pedal, fungerande servo och parkeringsbroms.' },
  { id: 'be-speglar', group: 'be', area: 'Urval', task: 'Kontrollera backspeglarna', lookFor: 'Sikt bakom och längs släpet, extra speglar vid brett släp.' },
  { id: 'be-blinkers', group: 'be', area: 'Urval', task: 'Kontrollera blinkers på bil och släp', lookFor: 'Alla lampor fungerar, släpindikeringen blinkar vid fel/funktion.' },
  { id: 'be-vatskor', group: 'be', area: 'Urval', task: 'Kontrollera vätskorna på dragfordonet', lookFor: 'Olja, kylarvätska, bromsvätska och spolarvätska mellan min och max.' },
];

const AREAS: Record<SafetyGroup, LightSafetyArea[]> = {
  bil: ['Utvändigt', 'Under motorhuven', 'Förarplatsen'],
  mc: ['Däck och bromsar', 'Drivning och chassi', 'Belysning och reglage'],
  be: [],
};

const pickRandom = <T,>(pool: T[], count: number): T[] => {
  const copy = [...pool];
  const out: T[] = [];
  while (out.length < count && copy.length > 0) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};

/** Slumpade uppgifter för gruppen. `exclude` undviker att samma uppgifter kommer igen. */
export function pickLightSafetyTasks(group: SafetyGroup = 'bil', exclude: string[] = []): string[] {
  const inGroup = LIGHT_SAFETY_TASKS.filter(t => t.group === group);

  if (group === 'be') {
    const always = inGroup.filter(t => t.area === 'Alltid').map(t => t.id);
    const pool = inGroup.filter(t => t.area === 'Urval');
    const fresh = pool.filter(t => !exclude.includes(t.id));
    return [...always, ...pickRandom(fresh.length >= 2 ? fresh : pool, 2).map(t => t.id)];
  }

  return AREAS[group].map(area => {
    const pool = inGroup.filter(t => t.area === area);
    const fresh = pool.filter(t => !exclude.includes(t.id));
    return pickRandom(fresh.length > 0 ? fresh : pool, 1)[0].id;
  });
}

export function getLightSafetyTask(id: string): LightSafetyTask | undefined {
  return LIGHT_SAFETY_TASKS.find(t => t.id === id);
}
