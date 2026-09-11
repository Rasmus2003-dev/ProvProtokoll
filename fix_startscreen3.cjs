const fs = require('fs');
let code = fs.readFileSync('src/screens/Korprov/StartScreen.tsx', 'utf-8');

code = code.replace(
  "          testDate: new Date().toISOString().split('T')[0]\n        checklist: {",
  "          testDate: new Date().toISOString().split('T')[0]\n        },\n        checklist: {"
);

code = code.replace(
  "          questionsAnswered: false\n        includedTestItems: [],",
  "          questionsAnswered: false\n        },\n        includedTestItems: [],"
);

code = code.replace(
  "          notes: ''\n        causes: {",
  "          notes: ''\n        },\n        causes: {"
);

code = code.replace(
  "          safetyCheckFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false },\n  };",
  "          safetyCheckFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false }\n        }\n      }));\n    };"
);

fs.writeFileSync('src/screens/Korprov/StartScreen.tsx', code);
