import fs from 'fs';

let content = fs.readFileSync('src/data/testContentCatalog.ts', 'utf-8');

// 1. Re-add Registreringsbevis to HEAVY_BASE_SAFETY
content = content.replace(
  "  'Systematisk kontroll',\n  'Last'\n];",
  "  'Systematisk kontroll',\n  'Registreringsbevis',\n  'Last'\n];"
);

// 2. Remove BUS_SAFETY Dörrautomatik
content = content.replace(
  "const BUS_SAFETY = [\n  'Dörrautomatik/nödöppning',\n  'Säkerhetsutrustning'\n];",
  "const BUS_SAFETY = [\n  'Säkerhetsutrustning'\n];"
);

// 3. Remove cContent definition
const cContentRegex = /const cContent = \[[^\]]+\];/g;
content = content.replace(cContentRegex, '');

// 4. Change baseContent logic back
content = content.replace(
  "let items = [...(type === 'C' ? cContent : baseContent), ...HEAVY_BASE_SAFETY];",
  "let items = [...baseContent, ...HEAVY_BASE_SAFETY];"
);

content = content.replace(
  "if (isTruck && type !== 'C') {",
  "if (isTruck) {"
);

fs.writeFileSync('src/data/testContentCatalog.ts', content);

// Now patch KorningScreen.tsx to remove the separate boxes and just mix them in
let korning = fs.readFileSync('src/screens/Korprov/KorningScreen.tsx', 'utf-8');

// First, make sure taxiSpecificItems and busSpecificItems and heavyTruckItems are part of baseDrivingItems
korning = korning.replace(
  "const baseDrivingItems = filteredAvailableItems.filter(item => \n    !ALL_SAFETY_ITEMS.includes(item)\n  );",
  "const baseDrivingItems = filteredAvailableItems.filter(item => \n    !ALL_SAFETY_ITEMS.includes(item)\n  );"
);
// Wait, they ALREADY ARE part of baseDrivingItems, because I just filtered out ALL_SAFETY_ITEMS.
// So I just need to DELETE the separate UI rendering of them!

korning = korning.replace(/\{\/\* Taxi-Specific CheckPoints Section \*\/\}.*?(?=\{\/\* Main Grid: Baseline Driving Items \*\/\})/s, '');
// Wait, the regular expression might be tricky. Let's use a small script.
