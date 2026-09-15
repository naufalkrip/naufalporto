import React from 'react'

/**
 * BackgroundSprinkles:
 * Minimalist, animated ambient sparkles and micro-particles distributed seamlessly
 * across the background of the public portfolio. Adds dynamic visual depth and delightful
 * scrolling texture without cluttering or distracting from the content.
 */
export const BackgroundSprinkles: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* ========================================================================= */}
      {/* 1. HERO & TOP REGION (0% - 15% Scroll Depth)                             */}
      {/* ========================================================================= */}
      {/* Violet sparkle top left */}
      <div className="absolute top-[8%] left-[8%] sm:left-[12%] animate-sprinkle-twinkle opacity-70">
        <svg className="w-3.5 h-3.5 text-[#6c4df6]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z" />
        </svg>
      </div>

      {/* Magenta micro dot with soft glow */}
      <div className="absolute top-[14%] right-[10%] sm:right-[15%] animate-sprinkle-float">
        <div className="w-2 h-2 rounded-full bg-[#ec4899] opacity-60 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
      </div>

      {/* Tiny cyan ring top right */}
      <div className="absolute top-[6%] right-[28%] animate-sprinkle-drift hidden sm:block">
        <div className="w-3 h-3 rounded-full border-[1.5px] border-[#38bdf8] opacity-40" />
      </div>

      {/* Soft orange cross / plus */}
      <div className="absolute top-[20%] left-[22%] animate-sprinkle-twinkle-delayed opacity-50">
        <svg className="w-2.5 h-2.5 text-[#f97316]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 0h4v10h10v4H14v10h-4V14H0v-4h10V0z" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 2. ABOUT & STATS REGION (15% - 35% Scroll Depth)                         */}
      {/* ========================================================================= */}
      {/* Violet micro dot near about heading */}
      <div className="absolute top-[26%] right-[6%] sm:right-[8%] animate-sprinkle-float-delayed">
        <div className="w-2 h-2 rounded-full bg-[#6c4df6] opacity-55 shadow-[0_0_10px_rgba(108,77,246,0.4)]" />
      </div>

      {/* Pink mini star near about bio */}
      <div className="absolute top-[31%] left-[5%] sm:left-[10%] animate-sprinkle-twinkle opacity-65">
        <svg className="w-3 h-3 text-[#ec4899]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z" />
        </svg>
      </div>

      {/* Soft orange diamond/ring near metadata */}
      <div className="absolute top-[35%] right-[22%] animate-sprinkle-drift">
        <div className="w-2.5 h-2.5 rotate-45 border-[1.5px] border-[#f97316] opacity-45" />
      </div>

      {/* Subtle sky blue dot */}
      <div className="absolute top-[38%] left-[18%] animate-sprinkle-float hidden sm:block">
        <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] opacity-50" />
      </div>

      {/* ========================================================================= */}
      {/* 3. EXPERIENCE TIMELINE REGION (35% - 55% Scroll Depth)                   */}
      {/* ========================================================================= */}
      {/* Coral mini cross near experience section */}
      <div className="absolute top-[44%] left-[7%] sm:left-[14%] animate-sprinkle-twinkle-delayed opacity-50">
        <svg className="w-3 h-3 text-[#f97316]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 0h4v10h10v4H14v10h-4V14H0v-4h10V0z" />
        </svg>
      </div>

      {/* Violet sparkle on the right side of timeline */}
      <div className="absolute top-[48%] right-[8%] sm:right-[12%] animate-sprinkle-twinkle opacity-60">
        <svg className="w-3.5 h-3.5 text-[#6c4df6]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z" />
        </svg>
      </div>

      {/* Magenta micro ring near timeline track */}
      <div className="absolute top-[52%] left-[25%] animate-sprinkle-drift hidden sm:block">
        <div className="w-3 h-3 rounded-full border-[1.5px] border-[#ec4899] opacity-40" />
      </div>

      {/* Soft amber micro dot */}
      <div className="absolute top-[55%] right-[18%] animate-sprinkle-float">
        <div className="w-2 h-2 rounded-full bg-[#f97316] opacity-55 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
      </div>

      {/* ========================================================================= */}
      {/* 4. WORKS & PORTFOLIO SHOWCASE REGION (55% - 80% Scroll Depth)            */}
      {/* ========================================================================= */}
      {/* Sky blue sparkle near featured project */}
      <div className="absolute top-[61%] left-[6%] sm:left-[9%] animate-sprinkle-twinkle opacity-65">
        <svg className="w-3 h-3 text-[#38bdf8]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z" />
        </svg>
      </div>

      {/* Violet micro ring */}
      <div className="absolute top-[66%] right-[6%] sm:right-[14%] animate-sprinkle-drift">
        <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#6c4df6] opacity-45" />
      </div>

      {/* Magenta mini cross */}
      <div className="absolute top-[70%] left-[20%] animate-sprinkle-twinkle-delayed opacity-50 hidden sm:block">
        <svg className="w-2.5 h-2.5 text-[#ec4899]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 0h4v10h10v4H14v10h-4V14H0v-4h10V0z" />
        </svg>
      </div>

      {/* Soft violet glowing dot */}
      <div className="absolute top-[75%] right-[9%] sm:right-[11%] animate-sprinkle-float-delayed">
        <div className="w-2 h-2 rounded-full bg-[#6c4df6] opacity-60 shadow-[0_0_10px_rgba(108,77,246,0.45)]" />
      </div>

      {/* Orange sparkle near secondary cards */}
      <div className="absolute top-[78%] left-[7%] sm:left-[11%] animate-sprinkle-twinkle opacity-60">
        <svg className="w-3 h-3 text-[#f97316]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 5. CONTACT & CLOSING REGION (80% - 100% Scroll Depth)                    */}
      {/* ========================================================================= */}
      {/* Magenta sparkle near contact header */}
      <div className="absolute top-[84%] right-[7%] sm:right-[15%] animate-sprinkle-twinkle opacity-70">
        <svg className="w-3.5 h-3.5 text-[#ec4899]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z" />
        </svg>
      </div>

      {/* Violet diamond */}
      <div className="absolute top-[89%] left-[6%] sm:left-[13%] animate-sprinkle-drift">
        <div className="w-2.5 h-2.5 rotate-45 border-[1.5px] border-[#6c4df6] opacity-45" />
      </div>

      {/* Sky blue micro dot near CTA button */}
      <div className="absolute top-[93%] right-[20%] animate-sprinkle-float hidden sm:block">
        <div className="w-2 h-2 rounded-full bg-[#38bdf8] opacity-55 shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
      </div>

      {/* Amber/Peach mini cross near footer transition */}
      <div className="absolute top-[96%] left-[15%] sm:left-[24%] animate-sprinkle-twinkle-delayed opacity-50">
        <svg className="w-2.5 h-2.5 text-[#f97316]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 0h4v10h10v4H14v10h-4V14H0v-4h10V0z" />
        </svg>
      </div>
    </div>
  )
}

export default BackgroundSprinkles
