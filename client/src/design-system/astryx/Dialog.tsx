import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
  isDark?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  className = '',
  isDark = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`dialog-title-${Math.random().toString(36).slice(2, 9)}`).current;
  const descId = useRef(`dialog-desc-${Math.random().toString(36).slice(2, 9)}`).current;

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus container on open for keyboard accessibility
    setTimeout(() => {
      dialogRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-4xl',
  }[maxWidth];

  const surfaceClasses = isDark
    ? 'bg-[#1A3153] text-[#FAFAFA] border border-[rgba(167,199,231,0.25)] shadow-2xl'
    : 'bg-[#FAFAFA] text-[#1A3153] border border-[#A7C7E7] shadow-2xl';

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-[rgba(26,49,83,0.7)] backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses} rounded-[var(--radius-container)] ${surfaceClasses} max-h-[92dvh] flex flex-col overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200 ${className}`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 sm:p-6 pb-2 border-b border-[var(--color-border-subtle)] shrink-0">
            <div>
              {title && (
                <h2 id={titleId} className="font-heading font-bold text-lg sm:text-xl text-inherit">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-xs sm:text-sm mt-1 text-[var(--color-text-secondary)] opacity-90">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-full hover:bg-[rgba(167,199,231,0.2)] text-[var(--color-text-secondary)] hover:text-current transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
