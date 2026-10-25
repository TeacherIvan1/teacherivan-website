import React, { useEffect, useState } from 'react';
import { Mic, MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../modules/i18n/languageStore';

interface ChapterNavPillProps {
  onStartVoiceTest: () => void;
}

export const ChapterNavPill: React.FC<ChapterNavPillProps> = ({ onStartVoiceTest }) => {
  const { isEs } = useTranslation();
  const [activeChapter, setActiveChapter] = useState<string>('model');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Show nav pill once user scrolls past initial hero fold
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver to accurately track the active chapter
    const chapterIds = ['chapter-1-model', 'chapter-2-lab', 'chapter-3-plans', 'chapter-4-faq'];
    const observers: IntersectionObserver[] = [];

    chapterIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (id === 'chapter-1-model') setActiveChapter('model');
              if (id === 'chapter-2-lab') setActiveChapter('lab');
              if (id === 'chapter-3-plans') setActiveChapter('plans');
              if (id === 'chapter-4-faq') setActiveChapter('faq');
            }
          });
        },
        { rootMargin: '-20% 0px -50% 0px', threshold: 0.1 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const chapters = [
    {
      id: 'model',
      targetId: 'chapter-1-model',
      labelEn: 'Ch. 1 — The Model',
      labelEs: 'Ch. 1 — El Modelo',
    },
    {
      id: 'lab',
      targetId: 'chapter-2-lab',
      labelEn: 'Ch. 2 — AI Voice Lab',
      labelEs: 'Ch. 2 — Simulador IA',
    },
    {
      id: 'plans',
      targetId: 'chapter-3-plans',
      labelEn: 'Ch. 3 — The Plans',
      labelEs: 'Ch. 3 — Los Planes',
    },
    {
      id: 'faq',
      targetId: 'chapter-4-faq',
      labelEn: 'Ch. 4 — Questions',
      labelEs: 'Ch. 4 — Preguntas',
    },
  ];

  return (
    <aside
      id="pear-chapter-nav-bar"
      aria-label="Chapter Navigation"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 pointer-events-none w-[94%] max-w-4xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="pointer-events-auto flex items-center justify-between p-1.5 sm:p-2 rounded-full bg-[#12223a]/90 backdrop-blur-xl border border-[#A7C7E7]/35 shadow-2xl shadow-[#1A3153]/80 gap-1.5 sm:gap-2 text-[#FAFAFA]">
        {/* Chapters Items (Desktop & Tablet) */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {chapters.map((ch) => {
            const isActive = activeChapter === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => scrollToChapter(ch.targetId)}
                className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-montserrat font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-extrabold'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#1A3153]/70'
                }`}
              >
                {isEs ? ch.labelEs : ch.labelEn}
              </button>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Direct WhatsApp Action */}
          <a
            href="https://wa.me/59172878330"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center p-2 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#FAFAFA] transition-all cursor-pointer shadow-md"
            title={isEs ? 'WhatsApp Teacher Ivan (+591 72878330)' : 'WhatsApp Teacher Ivan (+591 72878330)'}
            aria-label="Contact Teacher Ivan on WhatsApp"
          >
            <MessageCircle size={15} />
          </a>

          {/* Primary High-Contrast #E09B30 Action Button */}
          <button
            type="button"
            onClick={onStartVoiceTest}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] font-montserrat font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-md shadow-[#E09B30]/30 cursor-pointer"
          >
            <Mic size={14} className="text-[#1A3153]" />
            <span className="hidden md:inline">
              {isEs ? 'Probar Nivel con IA' : 'Start 90s Voice Test'}
            </span>
            <span className="md:hidden">
              {isEs ? 'Probar IA' : 'Voice Test'}
            </span>
            <ArrowRight size={13} className="text-[#1A3153]" />
          </button>
        </div>
      </div>
    </aside>
  );
};
