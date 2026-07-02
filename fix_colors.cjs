const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-\[#333\]/g, "bg-slate-200 dark:bg-[#333]");
code = code.replace(/bg-\[#1a1a1a\]/g, "bg-slate-50 dark:bg-[#1a1a1a]");
code = code.replace(/bg-\[#1e1e2e\]/g, "bg-white shadow-sm dark:bg-[#1e1e2e]");
code = code.replace(/bg-\[#888\]/g, "bg-slate-400 dark:bg-[#888]");

fs.writeFileSync('src/App.tsx', code);
