import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/screens/Korprov/data/failureData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// The user said: lägg till en ny brist under "fordonskännedom" "Identifiera risker förknippade med fordonets funktion"
content = content.replace(
  `    "Fordonskännedom": [`,
  `    "Fordonskännedom": [\n      "Identifiera risker förknippade med fordonets funktion",`
);

fs.writeFileSync(filePath, content, 'utf-8');
