import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/screens/Korprov/ProtokollScreen.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Update PDF safety check result text when driving is failed
content = content.replace(
  `doc.text(state.result.safetyCheckResult || '-', margin + 180, y);`,
  `doc.text(state.result.drivingResult === 'Underkänt' ? '-' : (state.result.safetyCheckResult || '-'), margin + 180, y);`
);

// We should also change color to black for '-' 
content = content.replace(
  `if (state.result.safetyCheckResult === 'Godkänt') {
        doc.setTextColor(16, 124, 65);
      } else if (state.result.safetyCheckResult === 'Underkänt') {
        doc.setTextColor(200, 0, 24);
      } else {
        doc.setTextColor(0, 0, 0);
      }`,
  `if (state.result.drivingResult === 'Underkänt') {
        doc.setTextColor(0, 0, 0);
      } else if (state.result.safetyCheckResult === 'Godkänt') {
        doc.setTextColor(16, 124, 65);
      } else if (state.result.safetyCheckResult === 'Underkänt') {
        doc.setTextColor(200, 0, 24);
      } else {
        doc.setTextColor(0, 0, 0);
      }`
);

// Prevent "Din säkerhetskontroll är godkänd" when driving is failed
content = content.replace(
  `if (isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt') {`,
  `if (isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' && state.result.drivingResult !== 'Underkänt') {`
);

fs.writeFileSync(filePath, content, 'utf-8');
