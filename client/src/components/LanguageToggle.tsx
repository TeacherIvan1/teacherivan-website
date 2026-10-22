import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';

interface LanguageToggleProps {
  id?: string;
  className?: string;
  showIcon?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  id,
  className = '',
  showIcon = true,
}) => {
  const { lang, setLang } = useTranslation();

  return (
    <div
      id={id}
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-full bg-[#12223a] border border-[#A7C7E7]/30 shadow-inner shrink-0 ${className}`}
      role="group"
      aria-label="Language selector / Selector de idioma"
    >
      {showIcon && (
        <span className="pl-1 text-[#A7C7E7] flex items-center" aria-hidden="true">
          <Languages size={12} />
        </span>
      )}

      {/* English button */}
      <button
        type="button"
        id="lang-btn-en"
        onClick={() => setLang('en')}
        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-montserrat font-bold text-[10px] sm:text-xs uppercase tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] ${
          lang === 'en'
            ? 'bg-[#E09B30] text-[#1A3153] shadow-sm'
            : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
        }`}
        aria-pressed={lang === 'en'}
        title="Switch interface to English"
      >
        EN
      </button>

      <span className="text-[#A7C7E7]/40 text-[9px] sm:text-xs font-semibold select-none px-0.5">|</span>

      {/* Spanish button */}
      <button
        type="button"
        id="lang-btn-es"
        onClick={() => setLang('es')}
        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-montserrat font-bold text-[10px] sm:text-xs uppercase tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] ${
          lang === 'es'
            ? 'bg-[#E09B30] text-[#1A3153] shadow-sm'
            : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
        }`}
        aria-pressed={lang === 'es'}
        title="Cambiar interfaz a Español"
      >
        ES
      </button>
    </div>
  );
};

export default LanguageToggle;
