import fs from 'fs';
let content = fs.readFileSync('src/screens/Korprov/components/OfficialPrintLayout.tsx', 'utf-8');

content = content.replace(
  '<span className="font-semibold text-gray-800">Följande provinnehåll har ingått i ditt körprov:</span>',
  '<span className="font-bold text-gray-800">Följande provinnehåll har ingått i ditt körprov:</span>'
);

fs.writeFileSync('src/screens/Korprov/components/OfficialPrintLayout.tsx', content);
