import fs from 'fs';

let content = fs.readFileSync('src/screens/Korprov/components/OfficialPrintLayout.tsx', 'utf-8');

// Modernize the table a bit
content = content.replace(
  "table style={{ borderCollapse: 'collapse', width: '100%' }}",
  "table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '12px' }}"
);

content = content.replace(
  "th style={{ textAlign: 'left', padding: '6px 0', fontSize: '14px', fontWeight: 'bold' }}",
  "th style={{ textAlign: 'left', padding: '10px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #ddd' }}"
);

content = content.replace(
  "th style={{ textAlign: 'right', padding: '6px 0', fontSize: '14px', fontWeight: 'bold' }}",
  "th style={{ textAlign: 'right', padding: '10px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #ddd' }}"
);

// Add a nice subtle watermark-like stamp if approved
content = content.replace(
  "<div style={{ marginTop: '24px' }}>",
  "<div style={{ marginTop: '24px', position: 'relative' }}>\n" +
  "            {isGodkand && (\n" +
  "              <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.05, fontSize: '120px', fontWeight: 'bold', transform: 'rotate(-15deg)', pointerEvents: 'none' }}>\n" +
  "                 GODKÄND\n" +
  "              </div>\n" +
  "            )}"
);


fs.writeFileSync('src/screens/Korprov/components/OfficialPrintLayout.tsx', content);
