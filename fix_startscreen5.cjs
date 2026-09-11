const fs = require('fs');
let code = fs.readFileSync('src/screens/Korprov/StartScreen.tsx', 'utf-8');

code = code.replace(
  "        transmission: 'Manuell'\n      checklist: {",
  "        transmission: 'Manuell'\n      },\n      checklist: {"
);

code = code.replace(
  "        questionsAnswered: true\n      includedTestItems:",
  "        questionsAnswered: true\n      },\n      includedTestItems:"
);

code = code.replace(
  "          testAborted: false\n        safetyCheckFailure: {",
  "          testAborted: false\n        },\n        safetyCheckFailure: {"
);

code = code.replace(
  "          testAborted: false\n    // @ts-ignore",
  "          testAborted: false\n        }\n      }\n    };\n    // @ts-ignore"
);

fs.writeFileSync('src/screens/Korprov/StartScreen.tsx', code);
