const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Theme wrapper
code = code.replace(/bg-\[#0a0a0a\] text-\[#e5e5e5\]/g, "bg-slate-50 dark:bg-[#0B0C10] text-slate-900 dark:text-slate-100");
code = code.replace(/duration-200/g, "duration-300");

// Navbar
code = code.replace(/border-b border-\[#222\] bg-\[#111\]/g, "border-b border-slate-200 dark:border-[#262935] bg-white/80 dark:bg-[#0B0C10]/80 backdrop-blur-md");
code = code.replace(/text-\[#e5e5e5\]/g, "text-slate-900 dark:text-slate-100");
code = code.replace(/hover:bg-\[#222\]/g, "hover:bg-slate-100 dark:hover:bg-[#15171E]");
code = code.replace(/text-\[#888\]/g, "text-slate-500 dark:text-slate-400");

// Intro Section
code = code.replace(/text-\[#aaa\]/g, "text-slate-600 dark:text-slate-400");
code = code.replace(/bg-\[#222\] border border-\[#333\] focus:outline-none focus:border-\[#5e5ce6\] text-\[#e5e5e5\] text-lg/g, "bg-white dark:bg-[#15171E] border border-slate-200 dark:border-[#262935] shadow-sm focus:outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6] text-slate-900 dark:text-slate-100 text-lg transition-all duration-300");
code = code.replace(/text-\[#666\]/g, "text-slate-400 dark:text-slate-500");

// Dashboard Tabs
code = code.replace(/border-b border-\[#222\]/g, "border-b border-slate-200 dark:border-[#262935]");
code = code.replace(/bg-\[#1a1a1a\] text-white/g, "bg-white shadow-sm dark:bg-[#15171E] text-[#5e5ce6] dark:text-[#7877e6]");
code = code.replace(/text-\[#888\] hover:bg-\[#1a1a1a\] hover:text-white/g, "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-[#15171E]/50 hover:text-slate-900 dark:hover:text-slate-200");

// Card Container
code = code.replace(/bg-\[#161616\] rounded-xl border border-\[#282828\]/g, "bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm");

// Code Snippets
code = code.replace(/bg-\[#000\] rounded-lg p-4 border-l-\[3px\] border-\[#5e5ce6\] my-4/g, "bg-slate-50 dark:bg-[#0B0C10] rounded-lg p-4 border-l-[3px] border-[#5e5ce6] my-4");
code = code.replace(/text-\[10px\] font-mono px-2 py-0\.5 bg-\[#333\] text-\[#aaa\] rounded-\[4px\]/g, "text-[10px] font-mono px-2 py-0.5 bg-slate-200 dark:bg-[#262935] text-slate-600 dark:text-slate-300 rounded-[4px]");
code = code.replace(/text-\[13px\] font-mono text-\[#8abeb7\]/g, "text-[13px] font-mono text-[#0070f3] dark:text-[#8abeb7]");

// Recap Bullet
code = code.replace(/border border-\[#444\] rounded mt-\[2px\] shrink-0 bg-\[#222\]/g, "border border-slate-300 dark:border-[#444] rounded mt-[2px] shrink-0 bg-slate-100 dark:bg-[#222]");

// Quiz Buttons
code = code.replace(/border-\[#5e5ce6\] bg-\[#5e5ce6\]\/10 text-white/g, "border-[#5e5ce6] bg-[#5e5ce6]/10 text-[#5e5ce6] dark:text-white");
code = code.replace(/border-\[#333\] bg-transparent text-\[#aaa\] hover:bg-\[#222\] hover:text-\[#e5e5e5\]/g, "border-slate-200 dark:border-[#333] bg-transparent text-slate-600 dark:text-[#aaa] hover:bg-slate-50 dark:hover:bg-[#222] hover:text-slate-900 dark:hover:text-[#e5e5e5]");
code = code.replace(/border-green-500\/50 bg-green-500\/10 text-green-400/g, "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400");
code = code.replace(/border-red-500\/50 bg-red-500\/10 text-red-400/g, "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400");
code = code.replace(/border-\[#333\] bg-transparent text-\[#666\] opacity-50/g, "border-slate-200 dark:border-[#333] bg-transparent text-slate-400 dark:text-[#666] opacity-50");

// Flashcards
code = code.replace(/bg-\[#1a1a1a\] rounded-xl border border-\[#5e5ce6\]\/30/g, "bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-[#5e5ce6]/50");
code = code.replace(/bg-\[#333\] text-\[#aaa\] text-\[10px\]/g, "bg-slate-100 dark:bg-[#333] text-slate-500 dark:text-[#aaa] text-[10px]");

// Chat Bubbles
code = code.replace(/bg-\[#282828\] text-\[#e5e5e5\]/g, "bg-slate-100 dark:bg-[#282828] text-slate-800 dark:text-[#e5e5e5]");
code = code.replace(/bg-\[#1e1e2e\] text-\[#d1d1e0\]/g, "bg-[#f0f0ff] dark:bg-[#1e1e2e] text-[#33334d] dark:text-[#d1d1e0]");

// Chat Input Area
code = code.replace(/border-t border-\[#222\] bg-\[#161616\]/g, "border-t border-slate-100 dark:border-[#222] bg-white dark:bg-[#161616]");
code = code.replace(/bg-\[#222\] border border-\[#333\] rounded-\[30px\]/g, "bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-[#333] rounded-[30px]");
code = code.replace(/text-\[#e5e5e5\] placeholder-\[#666\]/g, "text-slate-900 dark:text-[#e5e5e5] placeholder-slate-400 dark:placeholder-[#666]");

// ScrollArea
code = code.replace(/bg-\[#111\]/g, "bg-slate-50 dark:bg-[#111]");
code = code.replace(/bg-\[#444\]/g, "bg-slate-300 dark:bg-[#444]");

// Flashcard fixes
code = code.replace(/bg-\[#333\] text-\[#aaa\]/g, "bg-slate-100 dark:bg-[#333] text-slate-500 dark:text-[#aaa]");
code = code.replace(/text-\[#aaa\] leading-relaxed text-sm/g, "text-slate-600 dark:text-[#aaa] leading-relaxed text-sm");

// General fix for text colors
code = code.replace(/text-\[#e5e5e5\]/g, "text-slate-900 dark:text-slate-100");
code = code.replace(/text-\[#aaa\]/g, "text-slate-600 dark:text-slate-300");

// Write back
fs.writeFileSync('src/App.tsx', code);
