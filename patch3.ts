import fs from 'fs';

let content = fs.readFileSync('src/screens/Korprov/KorningScreen.tsx', 'utf-8');

// Find sections and delete them
function removeSection(startStr, endStr) {
  let startIndex = content.indexOf(startStr);
  if (startIndex === -1) {
     console.log('Could not find', startStr);
     return;
  }
  let endIndex = content.indexOf(endStr, startIndex);
  if (endIndex === -1) {
     console.log('Could not find', endStr);
     return;
  }
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

removeSection("{/* Taxi Specific CheckPoints Section", "{/* Main Grid: Baseline Driving Items");
removeSection("{/* Bus Specific CheckPoints Section", "{/* Main Grid: Baseline Driving Items");
// Actually let's just make sure we only remove the blocks themselves. The next block is usually some other section or Main Grid.
// Let's look at the structure before the main grid.
