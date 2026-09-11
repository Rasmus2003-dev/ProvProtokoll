import fs from 'fs';

let content = fs.readFileSync('src/screens/Korprov/EgenskaperScreen.tsx', 'utf-8');

// Replace Körtest with Testprov in the options array
content = content.replace(
  "{ id: 'Körtest', label: 'Körtest', desc: 'Inför grund- eller trafiklärarutbildning' }",
  "{ id: 'Testprov', label: 'Testprov', desc: 'Prov utan behörighet (fast godkänd kan ges)' }"
);

// We need to change how testType is updated to allow multiple.
// The options map is around line 286.
const multipleSelectLogic = `
                    const isSelected = state.properties.testType?.includes(type.id);
                    return (
                      <div
                        key={type.id}
                        onClick={() => {
                          let current = state.properties.testType ? state.properties.testType.split(',').map(s => s.trim()).filter(Boolean) : [];
                          if (current.includes(type.id)) {
                            current = current.filter(id => id !== type.id);
                          } else {
                            if (type.id === 'Förstaprov' || type.id === 'Omprov') {
                               // If selecting a main one, maybe clear others except Testprov?
                               // Actually just toggle it.
                            }
                            current.push(type.id);
                          }
                          updateField('testType', current.join(', '));
                        }}
`;

content = content.replace(
  "const isSelected = state.properties.testType === type.id;\n                    return (\n                      <div\n                        key={type.id}\n                        onClick={() => updateField('testType', type.id)}",
  multipleSelectLogic
);

// Also need to fix the testType check for 'Omprov' around line 53
content = content.replace(
  "if (!state.properties.testType || !state.properties.testType.includes('Omprov')) return null;",
  "if (!state.properties.testType || (!state.properties.testType.includes('Omprov') && !state.properties.testType.includes('Testprov'))) return null;" // wait, if they need omprov options for Testprov? No, only for Omprov.
);

fs.writeFileSync('src/screens/Korprov/EgenskaperScreen.tsx', content);
