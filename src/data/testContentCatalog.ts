export const TEST_CONTENT: Record<string, string[]> = {
  B: [
    'Start från vägkant',
    'Start i lutning',
    'Backning',
    'Körställning',
    'Effektiv bromsning',
    'Parkering',
    'Vändning med manövrering',
    'Motorväg/motortrafikled',
    'Körning mot mål',
    'Signalreglerad korsning',
    'Vändning',
    'Järnväg/Spårvägskorsning',
    'Nedsatt sikt eller mörker',
    'Körfältsbyte',
    'Stillastående fordon/hinder',
    'Användande av reglage',
    'Säkerhetskontroll',
    'Oskyddade trafikanter',
    'Infart på landsväg',
    'Gatukorsning',
    'Vägarbetsområde',
    'Omkörning',
    'Riskfyllt väglag',
    'Smal/krokig väg',
    'Sväng från landsväg',
    'Landsväg',
    'Cirkulationsplats',
    'Körfält',
    'Möte'
  ],
};

export const HEAVY_SAFETY_ITEMS = [
  'Vätskor',
  'Rutor',
  'Varningssystem',
  'Vindrutetorkare och spolare',
  'Styrsystem',
  'Bromsar',
  'Däck, fälg och hjulbultar',
  'Backspeglar',
  'Färdskrivare',
  'Belysning, blinkers och signal',
  'Systematisk kontroll',
  'Registreringsbevis',
  'Stänkskydd',
  'Last'
];

// Apply B's content to all other categories, appending heavy safety items for heavy licenses and BE/B96
const baseContent = TEST_CONTENT.B;
const safetyRequiredTypes = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'BE', 'B96'];
const otherTypes = ['A', 'A1', 'A2', 'AM'];

safetyRequiredTypes.forEach(type => {
  TEST_CONTENT[type] = [...baseContent, ...HEAVY_SAFETY_ITEMS];
});

otherTypes.forEach(type => {
  TEST_CONTENT[type] = [...baseContent];
});

TEST_CONTENT['TAXI'] = [
  'Hantera GPS/Karta',
  'Passagerares säkerhet',
  'Fordonskontroll',
  'Parkering',
  'Stannande',
  'Körfältsbyte',
  'Körning i körfält',
  'Körning i cirkulationsplats',
  'Körning på landsväg',
  'Infart på landsväg',
  'Vägarbete/andra hinder',
  'Motorväg eller liknande',
  'Körning mot mål'
];



