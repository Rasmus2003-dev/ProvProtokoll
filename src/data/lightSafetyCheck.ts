// Förslag på uppgifter vid säkerhetskontroll för lätta fordon (B, B1, B96, taxi).
// Kandidaten utför kontrollen praktiskt och föreslår åtgärd vid brist.
// Varje prov får en uppgift per område, slumpat.

export type LightSafetyArea = 'Utvändigt' | 'Under motorhuven' | 'Förarplatsen';

export interface LightSafetyTask {
  id: string;
  area: LightSafetyArea;
  task: string;       // vad kandidaten ska kontrollera
  lookFor: string;    // vad inspektören lyssnar/tittar efter
}

export const LIGHT_SAFETY_LICENSES = ['B', 'B1', 'B96', 'TAXI'];

export const LIGHT_SAFETY_TASKS: LightSafetyTask[] = [
  // Utvändigt
  { id: 'u-dack-monster', area: 'Utvändigt', task: 'Kontrollera mönsterdjupet på ett däck', lookFor: 'Minst 1,6 mm sommar, 3 mm vinter (dec–mars). Visar med slitagevarnare eller mätare.' },
  { id: 'u-dack-skador', area: 'Utvändigt', task: 'Kontrollera däckens skick', lookFor: 'Letar efter sprickor, bulor, skärskador och ojämnt slitage. Vet att skadat däck ska bytas.' },
  { id: 'u-lufttryck', area: 'Utvändigt', task: 'Visa var rätt lufttryck står och hur det kontrolleras', lookFor: 'Dörrstolpe/tanklock/instruktionsbok. Kontrolleras med kalla däck.' },
  { id: 'u-halvljus', area: 'Utvändigt', task: 'Kontrollera halvljuset', lookFor: 'Tänder och går runt bilen, eller kontrollerar mot vägg/reflex. Båda sidor.' },
  { id: 'u-bromsljus', area: 'Utvändigt', task: 'Kontrollera bromsljusen', lookFor: 'Använder reflex i fönster/vägg eller ber om hjälp. Inklusive högt monterat bromsljus.' },
  { id: 'u-blinkers', area: 'Utvändigt', task: 'Kontrollera körriktningsvisare och varningsblinkers', lookFor: 'Alla lampor fram, bak och på sidan. Snabbare blinkfrekvens = trasig lampa.' },
  { id: 'u-backljus', area: 'Utvändigt', task: 'Kontrollera backljuset', lookFor: 'Tändning på, backväxel i, kontrollerar bakom bilen eller via reflex.' },
  { id: 'u-skylt', area: 'Utvändigt', task: 'Kontrollera skyltbelysning och registreringsskyltar', lookFor: 'Skyltarna rena och läsbara, skyltbelysningen fungerar.' },
  { id: 'u-rutor', area: 'Utvändigt', task: 'Kontrollera rutor och backspeglar', lookFor: 'Inga sprickor i siktfältet, rena rutor, hela och rätt inställda speglar.' },
  { id: 'u-torkare', area: 'Utvändigt', task: 'Kontrollera torkarbladen', lookFor: 'Gummit helt och mjukt, inga ränder. Vet när bladen behöver bytas.' },

  // Under motorhuven
  { id: 'm-olja', area: 'Under motorhuven', task: 'Kontrollera motoroljenivån', lookFor: 'Bil på plant underlag, motor avstängd en stund. Mätstickan mellan min och max.' },
  { id: 'm-kylarvatska', area: 'Under motorhuven', task: 'Kontrollera kylarvätskenivån', lookFor: 'Nivå mellan min/max i expansionskärlet. Öppnar inte locket på varm motor.' },
  { id: 'm-bromsvatska', area: 'Under motorhuven', task: 'Kontrollera bromsvätskenivån', lookFor: 'Nivå mellan min/max. Vet att låg nivå kan tyda på slitage eller läckage.' },
  { id: 'm-spolarvatska', area: 'Under motorhuven', task: 'Kontrollera spolarvätskan', lookFor: 'Hittar behållaren, kontrollerar nivån. Vintertid frostskyddad vätska.' },
  { id: 'm-servo', area: 'Under motorhuven', task: 'Visa var servooljan finns (om hydraulisk servo)', lookFor: 'Hittar behållaren eller vet att bilen har elektrisk servo.' },

  // Förarplatsen
  { id: 'f-fardbroms', area: 'Förarplatsen', task: 'Kontrollera färdbromsen', lookFor: 'Pedalen fast, inte för lång pedalväg. Provbroms i låg fart.' },
  { id: 'f-bromsservo', area: 'Förarplatsen', task: 'Kontrollera bromsservon', lookFor: 'Pumpar pedalen med motorn av, håller nedtryckt, startar – pedalen sjunker något.' },
  { id: 'f-parkeringsbroms', area: 'Förarplatsen', task: 'Kontrollera parkeringsbromsen', lookFor: 'Håller bilen stilla, varningslampan tänds. Elektrisk broms: visar funktion.' },
  { id: 'f-styrservo', area: 'Förarplatsen', task: 'Kontrollera styrning och styrservo', lookFor: 'Inget onormalt glapp, servon lättar när motorn startas.' },
  { id: 'f-signalhorn', area: 'Förarplatsen', task: 'Kontrollera signalhornet', lookFor: 'Fungerar – används med hänsyn till omgivningen.' },
  { id: 'f-varningslampor', area: 'Förarplatsen', task: 'Förklara varningslamporna i instrumentpanelen', lookFor: 'Känner igen röda (stanna) och gula (åtgärda snart) lampor, t.ex. oljetryck och broms.' },
  { id: 'f-defroster', area: 'Förarplatsen', task: 'Visa hur rutorna hålls imfria', lookFor: 'Defroster, fläkt mot ruta, AC och bakrutevärme.' },
  { id: 'f-balten', area: 'Förarplatsen', task: 'Kontrollera säkerhetsbältena', lookFor: 'Bältet låser vid ryck, inga skador på bandet, fungerande lås.' },
  { id: 'f-varningstriangel', area: 'Förarplatsen', task: 'Visa var varningstriangeln finns och hur den används', lookFor: 'Hittar triangeln, vet att den ställs ut en bit bakom bilen vid stopp.' },
];

const AREAS: LightSafetyArea[] = ['Utvändigt', 'Under motorhuven', 'Förarplatsen'];

/** En slumpad uppgift per område. `exclude` undviker att samma uppgifter kommer igen. */
export function pickLightSafetyTasks(exclude: string[] = []): string[] {
  return AREAS.map(area => {
    const pool = LIGHT_SAFETY_TASKS.filter(t => t.area === area);
    const fresh = pool.filter(t => !exclude.includes(t.id));
    const from = fresh.length > 0 ? fresh : pool;
    return from[Math.floor(Math.random() * from.length)].id;
  });
}

export function getLightSafetyTask(id: string): LightSafetyTask | undefined {
  return LIGHT_SAFETY_TASKS.find(t => t.id === id);
}
