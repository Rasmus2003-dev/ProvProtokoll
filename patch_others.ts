import fs from 'fs';

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8');
  content = content.replace(/state\.properties\.testType === 'Omprov säkerhetskontroll'/g, "state.properties.testType?.includes('Omprov säkerhetskontroll')");
  content = content.replace(/state\.properties\.testType !== 'Omprov säkerhetskontroll'/g, "!state.properties.testType?.includes('Omprov säkerhetskontroll')");
  
  content = content.replace(/state\.properties\.testType === 'Omprov körning'/g, "state.properties.testType?.includes('Omprov körning')");
  content = content.replace(/state\.properties\.testType !== 'Omprov körning'/g, "!state.properties.testType?.includes('Omprov körning')");
  
  content = content.replace(/state\.properties\.testType === 'Testprov'/g, "state.properties.testType?.includes('Testprov')");
  
  // also fix the Behorighet Text logic in OfficialPrintLayout.tsx and generateProtocolPdf.ts
  if (filepath.includes('OfficialPrintLayout.tsx') || filepath.includes('generateProtocolPdf.ts')) {
     // If it's a Testprov, we should say "Ingen behörighet uppnådd" even if passed.
     // Let's find "let behorighetText" and modify the logic.
     content = content.replace(
       "if (isGodkand && state.properties.licenseType) {",
       "if (isGodkand && state.properties.licenseType && !state.properties.testType?.includes('Testprov')) {"
     );
  }
  
  fs.writeFileSync(filepath, content);
}

patchFile('src/screens/Korprov/KorningScreen.tsx');
patchFile('src/screens/Korprov/components/OfficialPrintLayout.tsx');
patchFile('src/lib/generateProtocolPdf.ts');
patchFile('src/screens/Korprov/ProtokollScreen.tsx');

