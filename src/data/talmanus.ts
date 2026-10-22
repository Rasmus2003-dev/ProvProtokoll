// Talmanus för inledningen av ett körprov – ett påhittat, pedagogiskt manus
// i samma anda som Trafikverkets "Så går provet till". Inspektören läser
// repliker (say) och följer anvisningarna (do). Anpassas efter behörighet,
// provtyp och om säkerhetskontroll ingår.

export interface ScriptLine {
  say?: string;
  do?: string;
}

export interface ScriptSection {
  id: string;
  title: string;
  lines: ScriptLine[];
}

interface ScriptContext {
  candidateName: string;
  inspectorName: string;
  license: string;
  testType: string;
  driveTime?: string;
  safetyCheckTitle?: string;
  interpreter?: string;
}

const HEAVY = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
const TRAILER = ['BE', 'B96', 'C1E', 'CE', 'D1E', 'DE'];
const BUS = ['D1', 'D', 'D1E', 'DE'];
const MC = ['AM', 'A1', 'A2', 'A'];

export function buildTalmanus(ctx: ScriptContext): ScriptSection[] {
  const first = ctx.candidateName.trim().split(/\s+/)[0] || 'du';
  const me = ctx.inspectorName.trim().split(/\s+/)[0] || 'jag';
  const lic = ctx.license;
  const omprovKorning = ctx.testType.includes('Omprov körning');
  const omprovSakerhet = ctx.testType.includes('Omprov säkerhetskontroll');
  const bedomning = ctx.testType.includes('Bedömningsprov') || ctx.testType.includes('Testprov');
  const hasSafety = !omprovKorning && Boolean(ctx.safetyCheckTitle);
  const hasDriving = !omprovSakerhet;
  const isMc = MC.includes(lic);

  const sections: ScriptSection[] = [];

  sections.push({
    id: 'valkommen',
    title: 'Välkommen',
    lines: [
      { do: 'Möt kandidaten i väntrummet. Säg namnet och ta i hand om det känns naturligt.' },
      { say: `Hej, är det ${first}? Välkommen! Jag heter ${me} och det är jag som har ditt prov i dag.` },
      { say: `Det är ${bedomning ? 'ett bedömningsprov' : omprovKorning ? 'ett omprov, bara körningen den här gången' : omprovSakerhet ? 'ett omprov, bara säkerhetskontrollen den här gången' : `ett körprov för behörighet ${lic}`}. Innan vi går ut ska vi göra några saker tillsammans, så tar vi det lugnt.` },
      ...(ctx.interpreter ? [{ do: `Presentera tolken. Tala direkt till kandidaten, inte till tolken (${ctx.interpreter}).` }] : []),
    ],
  });

  sections.push({
    id: 'identitet',
    title: 'Identitet och EES-intyg',
    lines: [
      { say: 'Får jag se din legitimation? Jag skannar den här, det går fort.' },
      { do: 'Skanna körkortet eller kontrollera legitimationen. Jämför fotot med kandidaten.' },
      { say: 'Tack. Nu vill jag att du läser igenom intyget på skärmen. Det handlar om att du inte har ett körkort från något annat EES-land. Stämmer det, skriver du under med fingret.' },
      { do: 'Låt kandidaten signera EES-intyget. Vill hen inte, hoppa över och ange varför.' },
    ],
  });

  sections.push({
    id: 'upplagg',
    title: 'Så går provet till',
    lines: [
      { say: `Så här går det till i dag.${hasSafety ? ' Vi börjar med en säkerhetskontroll av fordonet' + (hasDriving ? ', och sedan kör vi.' : '.') : ' Vi går direkt ut och kör.'}` },
      ...(hasDriving && ctx.driveTime ? [{ say: `Själva körningen tar ungefär ${lic === 'B' ? 'en halvtimme' : 'den tid som krävs för behörigheten'}. ${ctx.driveTime}` }] : []),
      { say: 'Jag vill se hur du kör till vardags, säkert och med gott omdöme. Du behöver inte köra perfekt – enstaka små misstag som inte påverkar säkerheten gör inte att du blir underkänd.' },
      { say: 'Vi kör i olika miljöer: tätort, landsväg och gärna några korsningar och cirkulationsplatser.' },
    ],
  });

  if (hasSafety) {
    sections.push({
      id: 'sakerhet',
      title: ctx.safetyCheckTitle || 'Säkerhetskontroll',
      lines: [
        { say: 'Jag vill att du börjar med en säkerhetskontroll av fordonet, sen när du är klar vill jag att du säger till mig.' },
        { say: `Jag ber dig kontrollera några saker på ${BUS.includes(lic) ? 'bussen' : HEAVY.includes(lic) ? 'lastbilen' : isMc ? 'motorcykeln' : 'fordonet'}. Berätta gärna högt vad du gör och varför.` },
        ...(TRAILER.includes(lic) ? [{ say: 'Du kommer också att koppla isär och koppla ihop ekipaget. Ta den tid du behöver och kontrollera kopplingen ordentligt.' }] : []),
        { say: 'Hittar du ett fel vill jag att du säger vad du skulle göra åt det.' },
        { do: 'Slumpa gärna en funktionsfråga under körningen om det passar.' },
      ],
    });
  }

  if (hasDriving) {
    sections.push({
      id: 'korning',
      title: 'Under körningen',
      lines: [
        ...(isMc
          ? [{ say: 'Du får instruktioner i hörlurarna från mig. Jag kör bakom dig. Hör du inte vad jag säger, stanna där det är säkert.' }]
          : [{ say: 'Jag säger i god tid vart vi ska. Säg till om du inte hör eller förstår – jag upprepar gärna.' }]),
        { say: 'En stund kommer du att köra själv mot ett mål, efter skyltar eller en beskrivning. Kör du fel gör det inget, då hittar vi en ny väg tillsammans.' },
        { say: 'Jag kommer att be dig göra några manövrer, till exempel en backning eller en parkering.' },
        { say: `Om jag behöver ${isMc ? 'stoppa dig' : 'ingripa'} för att undvika en farlig situation så gör jag det. Det påverkar bedömningen, men säg inget – kör bara vidare som vanligt.` },
        { do: 'Starta provtiden när ni rullar iväg.' },
      ],
    });
  }

  sections.push({
    id: 'efter',
    title: 'Efter provet',
    lines: [
      { say: bedomning
        ? 'När vi är tillbaka går vi igenom hur det gick. Det här provet ger ingen behörighet, det är en bedömning av var du står.'
        : 'När vi är tillbaka får du veta resultatet direkt, och vi pratar kort om hur det gick. Protokollet skickas till din e-post.' },
      { say: 'Har du några frågor innan vi börjar?' },
      { do: 'Svara på frågorna. Bocka av checklistan och gå vidare till körningen.' },
    ],
  });

  return sections;
}
