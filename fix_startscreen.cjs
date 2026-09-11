const fs = require('fs');
let code = fs.readFileSync('src/screens/Korprov/StartScreen.tsx', 'utf-8');

// Fix 1: useEffect
code = code.replace(
  "          transmission: prev.properties.transmission || 'Manuell'\n  }, [studentName",
  "          transmission: prev.properties.transmission || 'Manuell'\n        }\n      }));\n    }\n  }, [studentName"
);

// Fix 2: handleUpdateProp 1
code = code.replace(
  "      if (field === 'licenseType') {\n        updatedTestItems = [];\n      return {",
  "      if (field === 'licenseType') {\n        updatedTestItems = [];\n      }\n      return {"
);

// Fix 3: handleUpdateProp 2
code = code.replace(
  "        includedTestItems: updatedTestItems\n  };",
  "        includedTestItems: updatedTestItems\n      };\n    });\n  };"
);

// Fix 4: setPresetCandidate
code = code.replace(
  "                    onClick={() => setPresetCandidate({\n                      studentName: item.studentName,\n                      personalNumber: item.personalNumber,\n                      email: item.email,\n                      licenseType: item.licenseType,\n                      testType: item.testType,\n                      transmission: item.transmission\n                    className={`w-full p-4",
  "                    onClick={() => setPresetCandidate({\n                      studentName: item.studentName,\n                      personalNumber: item.personalNumber,\n                      email: item.email,\n                      licenseType: item.licenseType,\n                      testType: item.testType,\n                      transmission: item.transmission\n                    })}\n                    className={`w-full p-4"
);

// Fix 5: setPresetCandidate handleUpdateProp body
code = code.replace(
  "    const setPresetCandidate = (candidate: {\n      studentName: string;\n      personalNumber: string;\n      email: string;\n      licenseType: string;\n      testType: string;\n      transmission: string;\n    }) => {\n      updateState((prev) => ({\n        ...prev,\n        properties: {\n          ...prev.properties,\n          ...candidate\n        }\n      }));\n    };",
  "    const setPresetCandidate = (candidate: {\n      studentName: string;\n      personalNumber: string;\n      email: string;\n      licenseType: string;\n      testType: string;\n      transmission: string;\n    }) => {\n      updateState((prev) => ({\n        ...prev,\n        properties: {\n          ...prev.properties,\n          ...candidate\n        }\n      }));\n    };"
)

fs.writeFileSync('src/screens/Korprov/StartScreen.tsx', code);
