const fs = require('fs');
let code = fs.readFileSync('src/screens/Korprov/StartScreen.tsx', 'utf-8');

code = code.replace(
  "      if (field === 'licenseType') {\n        updatedTestItems = [];\n        \n      return {",
  "      if (field === 'licenseType') {\n        updatedTestItems = [];\n      }\n      return {"
);

fs.writeFileSync('src/screens/Korprov/StartScreen.tsx', code);
