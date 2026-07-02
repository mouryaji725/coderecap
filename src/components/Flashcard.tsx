import React, { useState } from 'react';

export const Flashcard = ({ card }: { card: any }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="perspective-[1000px] w-full h-64 mb-4 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500" 
        style={{ 
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        <div 
          className="absolute inset-0 w-full h-full bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-[#262935] shadow-sm flex flex-col items-center justify-center p-6 text-center" 
          style={{ backfaceVisibility: "hidden" }}
        >
          <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">{card.front}</h3>
          <span className="absolute bottom-4 text-[10px] bg-slate-200 dark:bg-[#333] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-[4px] tracking-wide uppercase">Click to flip</span>
        </div>
        <div 
          className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-[#5e5ce6]/50 flex items-center justify-center p-6 text-center" 
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{card.back}</p>
        </div>
      </div>
    </div>
  );
};
