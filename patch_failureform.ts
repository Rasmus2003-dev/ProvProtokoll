import fs from 'fs';

let content = fs.readFileSync('src/screens/Korprov/components/FailureForm.tsx', 'utf-8');

// Replace flex flex-wrap with a grid
content = content.replace(
  "<div className=\"flex flex-wrap gap-2 pt-1\">",
  "<div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2\">"
);

// To make the list sort downwards (column by column), we can split it.
// Actually, let's just make it a grid and see if the user likes it. It's much cleaner than flex-wrap.
// Wait! If I just split the array into 3 columns, it's safer and gives exactly "rangordnat nedåt".

fs.writeFileSync('src/screens/Korprov/components/FailureForm.tsx', content);
