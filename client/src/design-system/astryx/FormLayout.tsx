import React from 'react';

export interface FieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  isRequired?: boolean;
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

export const Field: React.FC<FieldProps> = ({
  label,
  description,
  error,
  isRequired,
  children,
  className = '',
  isDark = false,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className={`block text-xs sm:text-sm font-semibold ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
          {label}
          {isRequired && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className={`text-xs ${isDark ? 'text-[var(--astryx-denim-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-[#EF4444] font-medium animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
};

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  isDark?: boolean;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(({
  isError = false,
  isDark = false,
  icon,
  endIcon,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full rounded-[var(--radius-inner)] px-3 py-2 text-sm transition-all duration-200 outline-none border focus:ring-2';

  const themeClasses = isDark
    ? 'bg-[#12223a] text-[#FAFAFA] border-[rgba(167,199,231,0.25)] focus:border-[#E09B30] focus:ring-[#E09B30]/30 placeholder-[rgba(167,199,231,0.4)]'
    : 'bg-[#FAFAFA] text-[#1A3153] border-[#A7C7E7] focus:border-[#E09B30] focus:ring-[#E09B30]/20 placeholder-slate-400';

  const errorClasses = isError
    ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
    : '';

  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3 text-[var(--color-text-secondary)] pointer-events-none">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`${baseClasses} ${themeClasses} ${errorClasses} ${icon ? 'pl-9' : ''} ${endIcon ? 'pr-9' : ''} ${className}`}
        {...props}
      />
      {endIcon && (
        <span className="absolute right-3 text-[var(--color-text-secondary)]">
          {endIcon}
        </span>
      )}
    </div>
  );
});

TextInput.displayName = 'AstryxTextInput';

export interface FormWizardProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  children: React.ReactNode;
  className?: string;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  children,
  className = '',
}) => {
  const progressPercent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Wizard Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span className="font-heading font-semibold uppercase tracking-wider">
            Paso {currentStep} de {totalSteps}
          </span>
          {stepTitles && stepTitles[currentStep - 1] && (
            <span className="font-medium text-[var(--color-accent)]">
              {stepTitles[currentStep - 1]}
            </span>
          )}
        </div>
        <div className="w-full h-1.5 bg-[var(--color-background-muted)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
};
