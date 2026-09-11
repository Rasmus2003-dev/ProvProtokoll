import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/screens/Korprov/components/FailureForm.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The availableSituations currently combines state.includedTestItems and failureSituations.
// We want it to ONLY use state.includedTestItems if it's the driving test (type === 'driving').
// Actually, the user says "Bara de situationer man markerad skall komma här!"
// So we should just use state.includedTestItems.

content = content.replace(
  `  const availableSituations = useMemo(() => {
    const included = state.includedTestItems || [];
    const combined = Array.from(new Set([...included, ...failureSituations]));
    // Optionally sort them so that included items come first, or just keep them together
    return combined.sort((a, b) => {
      const aInc = included.includes(a);
      const bInc = included.includes(b);
      if (aInc && !bInc) return -1;
      if (!aInc && bInc) return 1;
      return 0;
    });
  }, [state.includedTestItems]);`,
  `  const availableSituations = useMemo(() => {
    const included = state.includedTestItems || [];
    if (included.length > 0) return included;
    // Fallback if none are checked (maybe they skipped checking)
    return failureSituations;
  }, [state.includedTestItems]);`
);

fs.writeFileSync(filePath, content, 'utf-8');
