import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type AstryxButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type AstryxButtonSize = 'sm' | 'md' | 'lg';

export interface AstryxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AstryxButtonVariant;
  size?: AstryxButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, AstryxButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon,
  endIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}, ref) => {
  const isButtonDisabled = disabled || isDisabled || isLoading;

  // Astryx Base Button Styling with Custom Property Token Integration
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-[var(--radius-inner)] gap-1.5',
    md: 'text-sm px-4 py-2 rounded-[var(--radius-element)] gap-2',
    lg: 'text-base px-6 py-3 rounded-[var(--radius-container)] gap-2.5 font-semibold',
  }[size];

  const variantClasses = {
    // Primary: Warm Amber (#E09B30) -> darkens slightly on hover
    primary: 'bg-[var(--color-accent)] hover:bg-[var(--astryx-amber-hover)] text-[var(--astryx-navy-primary)] font-bold shadow-sm hover:shadow-md focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-[#1A3153]',
    // Secondary: Soft Denim surface with Navy text
    secondary: 'bg-[var(--astryx-denim-primary)] hover:bg-[#92b5db] text-[var(--astryx-navy-primary)] font-semibold shadow-sm focus-visible:ring-[var(--astryx-denim-primary)]',
    // Outline: 1px border in #A7C7E7 or Navy
    outline: 'border border-[var(--color-border)] bg-transparent text-current hover:bg-[var(--astryx-denim-muted)] focus-visible:ring-[var(--color-border)]',
    // Ghost: Subtle hover tint
    ghost: 'bg-transparent text-current hover:bg-[var(--color-neutral)] focus-visible:ring-[var(--color-border)]',
    // Danger: Error Red
    danger: 'bg-[var(--color-error)] hover:bg-[#dc2626] text-white font-semibold shadow-sm focus-visible:ring-[var(--color-error)]',
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      disabled={isButtonDisabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && endIcon && <span className="inline-flex shrink-0">{endIcon}</span>}
    </button>
  );
});

Button.displayName = 'AstryxButton';
