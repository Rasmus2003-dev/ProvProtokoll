import fs from 'fs';
let content = fs.readFileSync('src/data/testContentCatalog.ts', 'utf-8');

content = content.replace("'Körning mot mål (muntlig vägbeskrivning)',\n", "");
content = content.replace("'Stannande på angiven plats',", "'Stannande',");

fs.writeFileSync('src/data/testContentCatalog.ts', content);
