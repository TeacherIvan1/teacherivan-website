import React from 'react';

export interface BrandWordmarkProps {
  isMobile?: boolean;
  onClick?: () => void;
  className?: string;
  /** 'dark' renders #FAFAFA + #E09B30 (for navy/dark backdrops); 'light' renders #1A3153 + #9A6515 (WCAG AA on #FAFAFA) */
  surface?: 'dark' | 'light';
}

/**
 * Editorial BrandWordmark (`<BrandWordmark />`)
 * -------------------------------------------------------------
 * Inline-flex baseline-aligned pairing:
 * - `/assets/logo-icon-mark.svg` (32px desktop / 28px mobile, explicit width/height for CLS = 0)
 * - "Teacher" in Montserrat weight 600
 * - "Ivan" in Mr Dafoe script (#E09B30 on dark surfaces, #9A6515 WCAG AA on light surfaces)
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  isMobile = false,
  onClick,
  className = '',
  surface = 'dark',
}) => {
  const iconSize = isMobile ? 28 : 32;
  const teacherColor = surface === 'light' ? '#1A3153' : '#FAFAFA';
  const ivanColor = surface === 'light' ? '#9A6515' : '#E09B30';

  const content = (
    <>
      <img
        src="/assets/logo-icon-mark.svg"
        alt="Teacher Ivan"
        width={iconSize}
        height={iconSize}
        decoding="async"
        style={{
          width: iconSize,
          height: iconSize,
          marginRight: isMobile ? 8 : 10,
          objectFit: 'contain',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', 'Inter', sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? 16 : 22,
            letterSpacing: '-0.02em',
            color: teacherColor,
            marginRight: isMobile ? 5 : 6,
          }}
        >
          Teacher
        </span>
        <span
          style={{
            fontFamily: "'Mr Dafoe', cursive",
            fontWeight: 400,
            fontSize: isMobile ? 25 : 34,
            color: ivanColor,
            lineHeight: 1,
          }}
        >
          Ivan
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        data-testid="brand-wordmark"
        aria-label="Teacher Ivan — Inicio"
        className={`inline-flex items-center select-none cursor-pointer bg-transparent border-0 p-0 min-h-[44px] ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      data-testid="brand-wordmark"
      className={`inline-flex items-center select-none ${className}`}
    >
      {content}
    </div>
  );
};

export default BrandWordmark;
