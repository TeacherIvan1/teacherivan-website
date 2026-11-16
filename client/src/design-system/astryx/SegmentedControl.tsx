import React from 'react';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  className?: string;
  isDarkTheme?: boolean;
  isCefrMode?: boolean;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  isFullWidth = false,
  className = '',
  isDarkTheme = true,
  isCefrMode = false,
}: SegmentedControlProps<T>) {
  const containerClasses = isDarkTheme
    ? 'bg-[#12223a] border border-[rgba(167,199,231,0.25)] p-1 rounded-[var(--radius-element)]'
    : 'bg-[var(--color-background-muted)] border border-[var(--color-border)] p-1 rounded-[var(--radius-element)]';

  const sizeClasses = {
    sm: 'text-xs py-1 px-2.5 gap-1.5',
    md: 'text-sm py-1.5 px-3.5 gap-2',
    lg: 'text-base py-2 px-4 gap-2.5 font-semibold',
  }[size];

  return (
    <div
      role="radiogroup"
      className={`inline-flex items-center select-none ${isFullWidth ? 'w-full' : ''} ${containerClasses} ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const fontTracking = isCefrMode ? 'font-heading uppercase tracking-[0.15em] font-bold' : 'font-medium';

        let buttonStyle = '';
        if (isSelected) {
          buttonStyle = isDarkTheme
            ? 'bg-[#E09B30] text-[#1A3153] shadow-sm font-bold scale-[1.01]'
            : 'bg-[#1A3153] text-[#FAFAFA] shadow-sm font-bold scale-[1.01]';
        } else {
          buttonStyle = isDarkTheme
            ? 'text-[var(--astryx-denim-primary)] hover:text-white hover:bg-[rgba(167,199,231,0.1)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(26,49,83,0.05)]';
        }

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={option.disabled}
            onClick={() => !option.disabled && onChange(option.value)}
            className={`flex-1 inline-flex items-center justify-center rounded-[var(--radius-inner)] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] ${sizeClasses} ${fontTracking} ${buttonStyle}`}
          >
            {option.icon && <span className="inline-flex shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge && <span className="inline-flex ml-1.5">{option.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
