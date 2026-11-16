import React from 'react';

export type AstryxCardVariant = 'default' | 'elevated' | 'dark' | 'outline' | 'interactive';

export interface AstryxCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AstryxCardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  isDark?: boolean;
}

export const Card: React.FC<AstryxCardProps> = ({
  variant = 'default',
  padding = 'md',
  isDark = false,
  className = '',
  children,
  ...props
}) => {
  const isDarkMode = isDark || variant === 'dark';

  const baseClasses = 'rounded-[var(--radius-container)] transition-all duration-200 border';

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  }[padding];

  const variantClasses = {
    default: 'bg-[#FAFAFA] border-[#A7C7E7] shadow-[var(--shadow-low)] text-[#1A3153]',
    elevated: 'bg-[#FAFAFA] border-[#A7C7E7] shadow-[var(--shadow-med)] text-[#1A3153]',
    dark: 'bg-[#1A3153] border-[rgba(167,199,231,0.25)] shadow-[var(--shadow-med)] text-[#FAFAFA]',
    outline: 'bg-transparent border-[#A7C7E7] text-current',
    interactive: 'bg-[#FAFAFA] border-[#A7C7E7] hover:border-[#E09B30] hover:shadow-[var(--shadow-med)] text-[#1A3153] cursor-pointer hover:-translate-y-0.5',
  }[variant];

  const darkOverride = isDarkMode && variant !== 'dark' ? 'bg-[#1A3153] border-[rgba(167,199,231,0.25)] text-[#FAFAFA]' : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses} ${variantClasses} ${darkOverride} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
