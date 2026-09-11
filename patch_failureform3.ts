import fs from 'fs';
let content = fs.readFileSync('src/screens/Korprov/components/FailureForm.tsx', 'utf-8');

content = content.replace(
  "className=\"columns-1 md:columns-2 lg:columns-3 gap-3 pt-2 space-y-3\"",
  "className=\"columns-1 md:columns-2 lg:columns-3 gap-3 pt-2\""
);

content = content.replace(
  "className={`break-inside-avoid w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-120 flex items-center gap-2.5 border shadow-sm ${",
  "className={`break-inside-avoid mb-3 w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-120 flex items-center gap-2.5 border shadow-sm ${"
);

fs.writeFileSync('src/screens/Korprov/components/FailureForm.tsx', content);
