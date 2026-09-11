const fs = require('fs');
let code = fs.readFileSync('src/screens/Korprov/StartScreen.tsx', 'utf-8');

code = code.replace(
  "      if (field === 'licenseType') {\n        updatedTestItems = [];\n      \n      return {",
  "      if (field === 'licenseType') {\n        updatedTestItems = [];\n      }\n      return {"
);

code = code.replace(
  "          safetyCheckFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false }\n        }\n      }));\n    };",
  "          safetyCheckFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false }\n        }\n      };\n    });\n  };"
);

fs.writeFileSync('src/screens/Korprov/StartScreen.tsx', code);
