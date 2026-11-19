import React from 'react';

export interface BrandLockupProps {
  /** Optional theme variation for light background sections */
  variant?: 'dark' | 'light';
  /** Size scaling for header vs footer vs hero */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class names */
  className?: string;
  /** Custom mascot alt text */
  altText?: string;
}

export const BrandLockup: React.FC<BrandLockupProps> = ({
  variant = 'dark',
  size = 'md',
  className = '',
  altText = 'Teacher Ivan Official Logo',
}) => {
  const isLight = variant === 'light';

  // Mascot dimensions (w-7 h-7 on mobile for compact header)
  const mascotDimensions = {
    sm: 'w-7 h-7 shrink-0',
    md: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
    lg: 'w-16 h-16 md:w-20 md:h-20',
  }[size];

  // Primary text size with whitespace-nowrap
  const primaryTextSize = {
    sm: 'text-sm sm:text-lg',
    md: 'text-lg sm:text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
  }[size];

  // Secondary subline size
  const sublineTextSize = {
    sm: 'text-[8px] sm:text-[9px] md:text-[10px]',
    md: 'text-[9px] sm:text-[10px] md:text-xs',
    lg: 'text-xs md:text-sm',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-3 select-none group cursor-pointer ${className}`}
      data-testid="official-brand-lockup"
    >
      {/* Master Bicronic Resonance Monogram with snapSettle hover micro-interaction */}
      <div className={`relative flex-shrink-0 ${mascotDimensions} flex items-center justify-center`}>
        <img
          src="/assets/logo.svg"
          alt={altText}
          className="w-full h-full object-contain filter drop-shadow-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:drop-shadow-[0_6px_14px_rgba(224,155,48,0.45)]"
          loading="eager"
        />
      </div>

      {/* Official Two-Line Typographic Block */}
      <div className="flex flex-col justify-center leading-none text-left">
        {/* Line 1: Teacher Ivan on a single line (never wraps) */}
        <div
          className={`font-montserrat font-bold tracking-tight whitespace-nowrap transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 ${primaryTextSize} text-[#1A3153] dark:text-[#FAFAFA]`}
        >
          Teacher <span className="text-[#9A6515] dark:text-[#E09B30]">I</span>van
        </div>

        {/* Line 2: ENGLISH CLASSES in uppercase, geometric sans-serif (Montserrat), tracking-[0.25em] (hidden on <640px for sm) */}
        <div
          className={`font-montserrat uppercase font-semibold tracking-[0.22em] sm:tracking-[0.25em] whitespace-nowrap transition-colors duration-200 ${sublineTextSize} mt-0.5 md:mt-1 ${
            size === 'sm' ? 'hidden sm:block' : ''
          } text-[#4A5568] dark:text-[#A7C7E7]`}
        >
          ENGLISH CLASSES
        </div>
      </div>
    </div>
  );
};

export default BrandLockup;
