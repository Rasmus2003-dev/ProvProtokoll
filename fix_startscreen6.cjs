const fs = require('fs');
let code = fs.readFileSync('src/screens/Korprov/StartScreen.tsx', 'utf-8');

code = code.replace(
  "                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-700'\n                  >",
  "                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-700'\n                    }`}\n                  >"
);

code = code.replace(
  "                        checklist: { ...prev.checklist, identityChecked: e.target.checked }\n                    className=\"peer w-6 h-6 shrink-0 opacity-0 absolute\"",
  "                        checklist: { ...prev.checklist, identityChecked: e.target.checked }\n                      }));\n                    }}\n                    className=\"peer w-6 h-6 shrink-0 opacity-0 absolute\""
);

fs.writeFileSync('src/screens/Korprov/StartScreen.tsx', code);
