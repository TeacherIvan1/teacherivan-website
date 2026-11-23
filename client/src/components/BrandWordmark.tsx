import React from 'react';

export interface BrandWordmarkProps {
  isMobile?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Editorial BrandWordmark (`<BrandWordmark />`)
 * -------------------------------------------------------------
 * Inline-flex baseline-aligned pairing:
 * - `/assets/logo-icon-mark.svg` (32px, marginRight: 10px)
 * - "Teacher" in Montserrat weight 500 (22px desktop / 18px mobile, letterSpacing: -0.02em, #FAFAFA)
 * - "Ivan" in Mr Dafoe script (34px desktop / 28px mobile, #E09B30 Warm Amber accent)
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  isMobile = false,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      data-testid="brand-wordmark"
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <img
        src="/assets/logo-icon-mark.svg"
        alt="Teacher Ivan Logo"
        style={{
          width: isMobile ? 28 : 32,
          height: isMobile ? 28 : 32,
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
            fontWeight: 500,
            fontSize: isMobile ? 16 : 22,
            letterSpacing: '-0.02em',
            color: '#FAFAFA',
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
            color: '#E09B30',
            lineHeight: 1,
          }}
        >
          Ivan
        </span>
      </span>
    </div>
  );
};

export default BrandWordmark;
