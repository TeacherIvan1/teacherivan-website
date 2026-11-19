import React, { useEffect, useState } from 'react';
import { Mic, ArrowRight, X } from 'lucide-react';
import { ChibiAvatar } from './ChibiAvatar';
import { useTranslation } from '../modules/i18n/languageStore';

interface CornerCoachWidgetProps {
  onLaunchVoiceLab?: () => void;
  className?: string;
}

export const CornerCoachWidget: React.FC<CornerCoachWidgetProps> = ({
  onLaunchVoiceLab,
  className = '',
}) => {
  const { isEs } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollidingSection, setIsCollidingSection] = useState(false);

  useEffect(() => {
    // Prevent persistent collisions on desktop and mobile in Hero, Voice Lab, FAQ, App CTA, or Footer
    const targetSelectors = [
      '#chapter-0-hero',
      '#hero-3d-stage',
      '#hero',
      '#chapter-2-voicelab',
      '#flagship-simulator-section',
      '#chapter-4-faq',
      '#final-cta-section',
      '#download-mobile-app-section',
      '#app-footer',
      'footer',
    ];

    const targets = targetSelectors
      .map((sel) => document.querySelector(sel))
      .filter((el): el is Element => el !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // If any conflicting section is in view, hide the floating widget
        const hasVisibleConflict = entries.some((entry) => entry.isIntersecting);
        setIsCollidingSection(hasVisibleConflict);
      },
      {
        threshold: 0.08,
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, []);

  if (isDismissed) return null;

  const handleLaunch = () => {
    if (onLaunchVoiceLab) {
      onLaunchVoiceLab();
    } else {
      const el =
        document.getElementById('chapter-2-voicelab') ||
        document.getElementById('flagship-simulator-section') ||
        document.getElementById('compact-voice-simulator');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const hiddenClasses = isCollidingSection
    ? 'opacity-0 pointer-events-none translate-y-4'
    : 'opacity-100 translate-y-0';

  return (
    <div
      id="corner-coach-widget"
      className={`fixed right-4 bottom-4 md:right-6 md:bottom-6 z-40 transition-all duration-300 ${hiddenClasses} ${className}`}
    >
      {/* ===================================================================== */}
      {/* MOBILE COMPACT CIRCULAR FAB (< 1024px): 56x56px touch target          */}
      {/* ===================================================================== */}
      <button
        type="button"
        onClick={handleLaunch}
        className="lg:hidden w-14 h-14 rounded-full border-2 border-[#E09B30] bg-[#132642] shadow-[0_4px_20px_rgba(224,155,48,0.4)] flex items-center justify-center relative group cursor-pointer focus:outline-none overflow-hidden"
        aria-label={isEs ? 'Abrir Laboratorio de Voz con Emma' : 'Open Voice Lab with Emma'}
      >
        <ChibiAvatar
          character="emma"
          state="speaking"
          className="w-16 h-16 translate-y-1.5 group-hover:scale-110 transition-transform"
        />
        <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#132642] animate-pulse" />
      </button>

      {/* ===================================================================== */}
      {/* DESKTOP EXPANDED PILL (>= 1024px): Full Interactive Diagnostic Banner  */}
      {/* ===================================================================== */}
      <div
        className="hidden lg:flex items-center gap-3 pl-2 pr-3 py-2 rounded-full border border-amber-brand/45 shadow-[var(--shadow-float-dark)]"
        style={{
          background: 'rgba(19, 38, 66, 0.92)',
          backdropFilter: 'blur(16px)',
          height: 64,
        }}
      >
        {/* Emma Avatar in glowing circular ring */}
        <div
          className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-brand shadow-[0_0_12px_rgba(224,155,48,0.5)] flex items-center justify-center bg-navy-surface shrink-0 cursor-pointer"
          onClick={handleLaunch}
        >
          <ChibiAvatar
            character="emma"
            state="speaking"
            className="w-14 h-14 -translate-y-1"
          />
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-navy-surface" />
        </div>

        {/* Two-line prompt */}
        <button
          onClick={handleLaunch}
          className="flex flex-col text-left cursor-pointer focus:outline-none"
        >
          <span className="text-[11px] font-bold text-amber-brand uppercase tracking-wider font-montserrat">
            {isEs ? '¿Listo para tu diagnóstico?' : 'Ready for your test?'}
          </span>
          <span className="text-xs font-semibold text-paper hover:text-amber-brand transition-colors flex items-center gap-1 font-sans">
            {isEs ? 'Test hablado 90s gratis' : 'Free 90s spoken test'}
            <ArrowRight size={12} className="text-amber-brand" />
          </span>
        </button>

        {/* Mic trigger CTA */}
        <button
          onClick={handleLaunch}
          className="w-9 h-9 rounded-full bg-amber-brand hover:bg-amber-hover text-navy-midnight flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title={isEs ? 'Iniciar Laboratorio de Voz' : 'Start Voice Lab'}
        >
          <Mic size={16} className="text-navy-midnight" />
        </button>

        {/* Close/dismiss icon */}
        <button
          onClick={() => setIsDismissed(true)}
          className="text-denim-soft/60 hover:text-paper p-1 rounded-full transition-colors cursor-pointer"
          title={isEs ? 'Cerrar' : 'Dismiss'}
          aria-label="Dismiss coach widget"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
