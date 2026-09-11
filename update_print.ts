import fs from 'fs';
let content = fs.readFileSync('src/screens/Korprov/components/OfficialPrintLayout.tsx', 'utf-8');

// Remove Grundorsak header
content = content.replace(
  '<b className="font-bold">Grundorsak till underkännandet är:</b>',
  ''
);

// Update intervention text
content = content.replace(
  '<div style={{ marginTop: \'16px\', fontWeight: \'bold\', color: \'#C80018\', fontSize: \'14px\' }}>\n                ⚠️ Ingripande har förekommit under körprovet.\n              </div>',
  '<div style={{ marginTop: \'16px\' }}>Ingripande har förekommit.</div>'
);

fs.writeFileSync('src/screens/Korprov/components/OfficialPrintLayout.tsx', content);
