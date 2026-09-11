import fs from 'fs';

let content = fs.readFileSync('src/screens/Korprov/ResultatScreen.tsx', 'utf-8');

// Replace Körtest with Testprov
content = content.replace(/Körtest/g, 'Testprov');

// Replace === 'Omprov säkerhetskontroll' with .includes('Omprov säkerhetskontroll')
content = content.replace(/state\.properties\.testType === 'Omprov säkerhetskontroll'/g, "state.properties.testType?.includes('Omprov säkerhetskontroll')");
content = content.replace(/state\.properties\.testType !== 'Omprov säkerhetskontroll'/g, "!state.properties.testType?.includes('Omprov säkerhetskontroll')");

// Replace === 'Omprov körning' with .includes('Omprov körning')
content = content.replace(/state\.properties\.testType === 'Omprov körning'/g, "state.properties.testType?.includes('Omprov körning')");
content = content.replace(/state\.properties\.testType !== 'Omprov körning'/g, "!state.properties.testType?.includes('Omprov körning')");

// Replace === 'Testprov' with .includes('Testprov')
content = content.replace(/state\.properties\.testType === 'Testprov'/g, "state.properties.testType?.includes('Testprov')");

fs.writeFileSync('src/screens/Korprov/ResultatScreen.tsx', content);
