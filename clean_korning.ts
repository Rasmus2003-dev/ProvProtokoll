import fs from 'fs';
let content = fs.readFileSync('src/screens/Korprov/KorningScreen.tsx', 'utf-8');

content = content.replace(/  const isTaxi = licenseType === 'TAXI';\n/g, "");
content = content.replace(/  const isBus = \['D1', 'D', 'D1E', 'DE'\].includes\(licenseType\);\n/g, "");

content = content.replace(/  const taxiSpecificItems = isTaxi \n    \? TAXI_SPECIFIC_ITEMS.filter\(item => filteredAvailableItems.includes\(item\)\)\n    : \[\];\n/g, "");
content = content.replace(/  const busSpecificItems = isBus \n    \? BUS_SPECIFIC_ITEMS.filter\(item => filteredAvailableItems.includes\(item\)\)\n    : \[\];\n/g, "");
content = content.replace(/, TAXI_SPECIFIC_ITEMS, BUS_SPECIFIC_ITEMS/g, "");

fs.writeFileSync('src/screens/Korprov/KorningScreen.tsx', content);
