import fs from 'fs';

let content = fs.readFileSync('src/screens/Korprov/components/FailureForm.tsx', 'utf-8');

// I need to find the rendering of availableSituations
// We can just use css columns. It's the absolute easiest way.
content = content.replace(
  "<div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2\">",
  "<div className=\"columns-1 md:columns-2 lg:columns-3 gap-3 pt-2 space-y-3\">"
);

// We need to add `break-inside-avoid` to the button to prevent it from splitting across columns.
content = content.replace(
  "className={`text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-120 flex items-center gap-2.5 border shadow-sm ${",
  "className={`break-inside-avoid w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-120 flex items-center gap-2.5 border shadow-sm ${"
);

fs.writeFileSync('src/screens/Korprov/components/FailureForm.tsx', content);
