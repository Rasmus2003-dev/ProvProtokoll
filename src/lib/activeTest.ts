// Steg i provflödet där ett prov pågår. Här ska appen inte laddas om
// (PWA-uppdatering, dra-för-att-uppdatera) och inspektören varnas vid stängning.
export const TEST_STEP_PATHS = [
  '/korprov/egenskaper',
  '/korprov/inledning',
  '/korprov/korning',
  '/korprov/resultat',
  '/korprov/protokoll',
];

export const TEST_STEP_NAMES: Record<string, string> = {
  '/korprov/egenskaper': 'Egenskaper',
  '/korprov/inledning': 'Inledning',
  '/korprov/korning': 'Körning',
  '/korprov/resultat': 'Resultat',
  '/korprov/protokoll': 'Protokoll',
};

export function isTestStepPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '');
  return TEST_STEP_PATHS.includes(normalized);
}
