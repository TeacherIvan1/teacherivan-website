import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useAuthStore } from '../modules/auth/authStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';

export const NovemberPromoBanner: React.FC = () => {
  const { isEs } = useTranslation();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { setActiveView } = useNavigationStore();

  const handleCtaClick = () => {
    if (!isAuthenticated) {
      openAuthModal(
        'signup',
        undefined,
        isEs
          ? '🎁 ¡Campaña Noviembre Gratis! Registrate en 30 segundos y desbloqueá el Simulador de Voz IA + Tu Ruta de Micro-Aprendizaje.'
          : '🎁 Free November Campaign! Sign up in 30 seconds to unlock the AI Voice Simulator + Micro-Learning Path.'
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
      <div className="max-w-6xl w-full flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center sm:text-left">
        {/* Banner Text */}
        <div className="flex items-center gap-1.5 justify-center flex-wrap leading-tight text-[11px] sm:text-xs">
          <span className="font-montserrat font-extrabold text-[#E09B30] tracking-wide inline-flex items-center gap-1">
            <Sparkles size={12} className="text-[#E09B30] animate-pulse" />
            {isEs ? 'CAMPAÑA NOVIEMBRE GRATIS:' : 'FREE NOVEMBER CAMPAIGN:'}
          </span>
          <span className="text-[#FAFAFA] font-medium">
            {isEs
              ? 'Registrate en 30 segundos y desbloqueá el Simulador de Voz IA (Emma & Teacher Ivan) + Tu Ruta de Micro-Aprendizaje 100% Gratis todo noviembre →'
              : 'Sign up in 30 seconds to unlock the 24/7 AI Voice Simulator (Emma & Teacher Ivan) + Your Micro-Learning Path 100% Free all November →'}
          </span>
        </div>

        {/* Accent Action Pill */}
        <button
          type="button"
          id="november-promo-cta-btn"
          onClick={handleCtaClick}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-extrabold text-[11px] sm:text-xs uppercase tracking-wider hover:bg-[#f0a83a] hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#E09B30]/25 cursor-pointer shrink-0"
        >
          <span>
            {!isAuthenticated
              ? (isEs ? 'Activar Acceso Gratis' : 'Claim Free Access')
              : (isEs ? 'Practicar Ahora' : 'Practice Now')}
          </span>
          <ArrowRight size={12} className="shrink-0" />
        </button>
      </div>
    </div>
  );
};
