import fs from 'fs';
let content = fs.readFileSync('src/screens/Korprov/KorningScreen.tsx', 'utf-8');
content = content.replace(/\{\/\* Taxi Specific CheckPoints Section \(TDOK 2018:0590\) \*\/\}[\s\S]*?(?=\{state\.properties\?\.testType \!\=\= 'Omprov säkerhetskontroll' && \()/g, "");
fs.writeFileSync('src/screens/Korprov/KorningScreen.tsx', content);
