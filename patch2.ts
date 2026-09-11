import fs from 'fs';

let content = fs.readFileSync('src/screens/Korprov/KorningScreen.tsx', 'utf-8');

// 1. Make baseDrivingItems include taxi and bus
content = content.replace(
  "const baseDrivingItems = filteredAvailableItems.filter(item => \n    !ALL_SAFETY_ITEMS.includes(item) && \n    !taxiSpecificItems.includes(item) &&\n    !busSpecificItems.includes(item)\n  );",
  "const baseDrivingItems = filteredAvailableItems.filter(item => \n    !ALL_SAFETY_ITEMS.includes(item)\n  );"
);

// 2. Remove the Taxi Specific block
content = content.replace(/\{\/\* Taxi Specific CheckPoints Section \*\/\}[\s\S]*?(?=\{\/\* Bus Specific CheckPoints Section \(TDOK 2018:0589\) \*\/\}|\{\/\* Main Grid: Baseline Driving Items \*\/\}|\{\/\* Heavy Safety CheckPoints Section \*\/\}|\{\/\* Heavy Truck CheckPoints Section \*\/\}|\{\/\* Train Specific CheckPoints Section \*\/\}|\{\/\* MC Specific CheckPoints Section \*\/\}|\{state\.properties\?\.testType \!\=\= 'Omprov säkerhetskontroll' && \()/g, "");

// 3. Remove the Bus Specific block
content = content.replace(/\{\/\* Bus Specific CheckPoints Section \(TDOK 2018:0589\) \*\/\}[\s\S]*?(?=\{\/\* Heavy Truck CheckPoints Section \*\/\}|\{\/\* Main Grid: Baseline Driving Items \*\/\}|\{\/\* Heavy Safety CheckPoints Section \*\/\}|\{\/\* Train Specific CheckPoints Section \*\/\}|\{\/\* MC Specific CheckPoints Section \*\/\}|\{state\.properties\?\.testType \!\=\= 'Omprov säkerhetskontroll' && \()/g, "");

// Wait, I should just use string split or something more robust.
// Let's just find the indexes.

fs.writeFileSync('src/screens/Korprov/KorningScreen.tsx', content);

