import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/screens/Korprov/components/OfficialPrintLayout.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Update driving fail logic for safety check
content = content.replace(
  `{state.result.safetyCheckResult || '-'}`,
  `{state.result.drivingResult === 'Underkänt' ? '-' : (state.result.safetyCheckResult || '-')}`
);

// Prevent "Din säkerhetskontroll är godkänd" when driving is failed
content = content.replace(
  `{isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' && (`,
  `{isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' && state.result.drivingResult !== 'Underkänt' && (`
);

fs.writeFileSync(filePath, content, 'utf-8');
