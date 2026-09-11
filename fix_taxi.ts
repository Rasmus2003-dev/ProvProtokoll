import fs from 'fs';
let content = fs.readFileSync('src/data/testContentCatalog.ts', 'utf-8');

// Change order to baseContent first, then TAXI_SPECIFIC_ITEMS
content = content.replace(
  "new Set([...TAXI_SPECIFIC_ITEMS, ...baseContent, 'Fordonskontroll'])",
  "new Set([...baseContent, ...TAXI_SPECIFIC_ITEMS, 'Fordonskontroll'])"
);

fs.writeFileSync('src/data/testContentCatalog.ts', content);
