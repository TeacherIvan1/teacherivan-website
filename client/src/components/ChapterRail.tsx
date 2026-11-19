import React, { useEffect, useState } from 'react';

interface Chapter {
  id: string;
  num: string;
  label: string;
}

const CHAPTERS: Chapter[] = [
  { id: 'chapter-0-hero', num: '00', label: 'HERO' },
  { id: 'chapter-1-bicronic', num: '01', label: 'MODEL' },
  { id: 'chapter-2-voicelab', num: '02', label: 'VOICE LAB' },
  { id: 'chapter-3-plans', num: '03', label: 'PLANS' },
  { id: 'chapter-4-faq', num: '04', label: 'FAQ' },
];

export const ChapterRail: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<string>('chapter-0-hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const el = document.getElementById(CHAPTERS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveChapter(CHAPTERS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Chapter navigation rail"
      className="hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-5 py-4 pointer-events-auto select-none"
    >
      {/* 1px Vertical track rule */}
      <div className="absolute right-[5px] top-2 bottom-2 w-[1px] bg-slate-400/20 -z-10" />

      {CHAPTERS.map((ch) => {
        const isActive = activeChapter === ch.id;

        return (
          <button
            key={ch.id}
            onClick={() => scrollToChapter(ch.id)}
            className="group flex items-center gap-2.5 focus:outline-none cursor-pointer"
            title={`${ch.num} ${ch.label}`}
          >
            {/* Label reveal on hover or active */}
            <span
              className={`text-[10px] font-mono tracking-wider transition-all duration-200 ${
                isActive
                  ? 'opacity-100 text-amber-brand font-bold translate-x-0'
                  : 'opacity-0 group-hover:opacity-100 text-slate-400 translate-x-1 group-hover:translate-x-0'
              }`}
            >
              {ch.num} {ch.label}
            </span>

            {/* Indicator Tick / Pill */}
            <div
              className={`transition-all duration-300 rounded-full ${
                isActive
                  ? 'w-2.5 h-6 bg-amber-brand shadow-[0_0_10px_rgba(224,155,48,0.6)]'
                  : 'w-2 h-2 bg-slate-400/40 group-hover:bg-amber-brand/70'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};
