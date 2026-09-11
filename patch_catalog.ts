import fs from 'fs';

let content = fs.readFileSync('src/data/testContentCatalog.ts', 'utf-8');

// The C_DRIVING list
const C_DRIVING = `[
  'Riskfyllt väglag',
  'Vägarbetsområde',
  'Omkörning',
  'Smal/krokig väg',
  'Möte',
  'Start från vägkant',
  'Motorväg/motortrafikled',
  'Körfältsbyte',
  'Start i lutning',
  'Signalreglerad korsning',
  'Landsväg',
  'Användande av reglage',
  'Backning',
  'Cirkulationsplats',
  'Parkering',
  'Körning mot mål',
  'Oskyddade trafikanter',
  'Gatukorsning',
  'Körställning',
  'Körfält'
]`;

// We also need to fix HEAVY_BASE_SAFETY and HEAVY_TRUCK_ITEMS
// Let's remove Registreringsbevis from HEAVY_BASE_SAFETY
content = content.replace("'Registreringsbevis',\\n  'Last'", "'Last'");

// Now let's change how C content is assigned.
// baseContent is TEST_CONTENT.B.filter(...)
content = content.replace(
  "const baseContent = TEST_CONTENT.B.filter(item => item !== 'Säkerhetskontroll');",
  "const baseContent = TEST_CONTENT.B.filter(item => item !== 'Säkerhetskontroll');\nconst cContent = " + C_DRIVING + ";"
);

content = content.replace(
  "let items = [...baseContent, ...HEAVY_BASE_SAFETY];",
  "let items = [...(type === 'C' ? cContent : baseContent), ...HEAVY_BASE_SAFETY];"
);

// We need to remove HEAVY_TRUCK_ITEMS from C because the user said "här kommer C! Om något saknas, radera allt överflödigt" and their list didn't include them.
content = content.replace(
  "if (isTruck) {\n    items = [...items, ...HEAVY_TRUCK_ITEMS];\n  }",
  "if (isTruck && type !== 'C') {\n    items = [...items, ...HEAVY_TRUCK_ITEMS];\n  }"
);

fs.writeFileSync('src/data/testContentCatalog.ts', content);
