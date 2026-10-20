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
  altText = 'Teacher Ivan Chibi Mascot',
}) => {
  const isLight = variant === 'light';

  // Mascot dimensions (w-9 h-9 on mobile for compact header)
  const mascotDimensions = {
    sm: 'w-9 h-9 md:w-10 md:h-10',
    md: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
    lg: 'w-16 h-16 md:w-20 md:h-20',
  }[size];

  // Primary text size with whitespace-nowrap
  const primaryTextSize = {
    sm: 'text-base sm:text-lg md:text-xl',
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
      className={`inline-flex items-center gap-2 sm:gap-3 select-none ${className}`}
      data-testid="official-brand-lockup"
    >
      {/* Brand Mascot (Teacher Ivan Chibi character) with preserved aspect ratio */}
      <div className={`relative flex-shrink-0 ${mascotDimensions} flex items-center justify-center`}>
        <img
          src="/assets/logo.svg"
          alt={altText}
          className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200 hover:scale-105"
          loading="eager"
        />
      </div>

      {/* Official Two-Line Typographic Block */}
      <div className="flex flex-col justify-center leading-none text-left">
        {/* Line 1: Teacher Ivan on a single line (never wraps) */}
        <div
          className={`font-montserrat font-bold tracking-tight whitespace-nowrap ${primaryTextSize} ${
            isLight ? 'text-[#1A3153]' : 'text-[#FAFAFA]'
          }`}
        >
          Teacher <span className="text-[#E09B30]">I</span>van
        </div>

        {/* Line 2: ENGLISH CLASSES in uppercase, geometric sans-serif (Montserrat), tracking-[0.25em] */}
        <div
          className={`font-montserrat uppercase font-semibold tracking-[0.22em] sm:tracking-[0.25em] whitespace-nowrap ${sublineTextSize} mt-0.5 md:mt-1 ${
            isLight ? 'text-[#4A5568]' : 'text-[#A7C7E7]'
          }`}
        >
          ENGLISH CLASSES
        </div>
      </div>
    </div>
  );
};

export default BrandLockup;
