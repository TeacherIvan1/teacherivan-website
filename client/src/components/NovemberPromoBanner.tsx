import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useAuthStore } from '../modules/auth/authStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';

export const NovemberPromoBanner: React.FC = () => {
  const { isEs } = useTranslation();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { setActiveView } = useNavigationStore();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Hide public promotional signup banner when student is authenticated
  if (isAuthenticated || isDismissed) return null;

  const handleCtaClick = () => {
    if (!isAuthenticated) {
      openAuthModal(
        'signup',
        undefined,
        isEs
          ? '¡Campaña Noviembre Gratis! Registrate en 30 segundos y desbloqueá el Laboratorio de Voz 24/7 + Tu Ruta de Micro-Aprendizaje.'
          : 'Free November Campaign! Sign up in 30 seconds to unlock the 24/7 Voice Lab + Micro-Learning Path.'
      );
    } else {
      setActiveView('simulator');
      const el = document.getElementById('compact-voice-simulator') || document.getElementById('view-simulator');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div
      id="november-promo-banner"
      className="w-full bg-gradient-to-r from-[#1A3153] via-[#0B1626] to-[#1A3153] border-b border-[#E09B30]/40 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-inter text-[#FAFAFA] flex items-center justify-center shadow-md relative z-50 overflow-hidden"
    >
      {/* Mobile (<768px): Sleek single-line dismissible bar ensuring Hero & CTA sit above fold */}
      <div className="md:hidden w-full flex items-center justify-between gap-2 max-w-full">
        <button
          type="button"
          onClick={handleCtaClick}
          className="flex-1 flex items-center gap-1.5 text-left text-[11px] font-montserrat font-bold text-[#E09B30] hover:text-[#f0a83a] truncate cursor-pointer focus:outline-none"
        >
          <svg className="w-4 h-4 text-[#E09B30] shrink-0 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
          </svg>
          <span className="truncate">
            {isEs ? 'Noviembre Gratis • Acceso 24/7 →' : 'Free November • 24/7 Access →'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-full text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors cursor-pointer shrink-0"
          title={isEs ? 'Descartar' : 'Dismiss'}
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>

      {/* Desktop & Tablet (>=768px): Full announcement bar with accent pill */}
      <div className="hidden md:flex max-w-6xl w-full items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap leading-tight text-xs">
          <span className="font-montserrat font-extrabold text-[#E09B30] tracking-wide inline-flex items-center gap-1.5 shrink-0">
            <svg className="w-4 h-4 text-[#E09B30] animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
            </svg>
            {isEs ? 'CAMPAÑA NOVIEMBRE GRATIS:' : 'FREE NOVEMBER CAMPAIGN:'}
          </span>
          <span className="text-[#FAFAFA] font-medium">
            {isEs
              ? 'Registrate en 30 segundos y desbloqueá el Laboratorio de Voz 24/7 (Emma & Teacher Ivan) + Tu Ruta de Micro-Aprendizaje 100% Gratis todo noviembre →'
              : 'Sign up in 30 seconds to unlock the 24/7 Voice Lab (Emma & Teacher Ivan) + Your Micro-Learning Path 100% Free all November →'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="november-promo-cta-btn"
            onClick={handleCtaClick}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-extrabold text-xs uppercase tracking-wider hover:bg-[#f0a83a] hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#E09B30]/25 cursor-pointer shrink-0"
          >
            <span>
              {!isAuthenticated
                ? (isEs ? 'Activar Acceso Gratis' : 'Claim Free Access')
                : (isEs ? 'Practicar Ahora' : 'Practice Now')}
            </span>
            <ArrowRight size={12} className="shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-full text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors cursor-pointer"
            title={isEs ? 'Descartar' : 'Dismiss'}
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
