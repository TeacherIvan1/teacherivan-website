import React from 'react';

export type AstryxBadgeVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'cefr'
  | 'amber'
  | 'navy';

export type AstryxBadgeSize = 'xs' | 'sm' | 'md';

export interface AstryxBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AstryxBadgeVariant;
  size?: AstryxBadgeSize;
  isCefr?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<AstryxBadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  isCefr = false,
  icon,
  className = '',
  children,
  ...props
}) => {
  const isCefrMode = isCefr || variant === 'cefr';

  const baseClasses = 'inline-flex items-center justify-center font-bold select-none rounded-[var(--radius-inner)] border';

  const trackingClass = isCefrMode ? 'uppercase tracking-[0.15em] font-heading font-extrabold' : 'font-medium';

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
  }[size];

  const variantClasses = {
    neutral: 'bg-[var(--color-background-muted)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]',
    info: 'bg-[var(--color-info-muted)] border-[var(--color-info)] text-[var(--color-text-info)]',
    success: 'bg-[var(--color-success-muted)] border-[var(--color-success)] text-[var(--color-text-success)]',
    warning: 'bg-[var(--color-warning-muted)] border-[var(--color-warning)] text-[var(--color-text-warning)]',
    error: 'bg-[var(--color-error-muted)] border-[var(--color-error)] text-[var(--color-text-error)]',
    cefr: 'bg-[#1A3153] border-[#E09B30] text-[#FAFAFA]',
    amber: 'bg-[var(--astryx-amber-muted)] border-[var(--color-accent)] text-[#c88624]',
    navy: 'bg-[#1A3153] border-[var(--astryx-denim-primary)] text-[#FAFAFA]',
  }[variant];

  return (
    <span
      className={`${baseClasses} ${trackingClass} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
