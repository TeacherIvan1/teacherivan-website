import React, { createContext, useContext } from 'react';

interface AstryxThemeContextValue {
  theme: string;
  isDark?: boolean;
}

const AstryxThemeContext = createContext<AstryxThemeContextValue>({
  theme: 'teacher-ivan',
  isDark: false,
});

export interface AstryxProviderProps {
  children: React.ReactNode;
  theme?: string;
  isDark?: boolean;
  className?: string;
}

/**
 * Astryx Design System Provider
 * Attaches data-astryx-theme to scope the CSS Custom Property cascade
 */
export const AstryxProvider: React.FC<AstryxProviderProps> = ({
  children,
  theme = 'teacher-ivan',
  isDark = false,
  className = '',
}) => {
  return (
    <AstryxThemeContext.Provider value={{ theme, isDark }}>
      <div
        data-astryx-theme={theme}
        data-theme={isDark ? 'dark' : 'light'}
        className={`astryx-root font-sans text-[var(--color-text-primary)] antialiased ${className}`}
      >
        {children}
      </div>
    </AstryxThemeContext.Provider>
  );
};

export const useAstryxTheme = () => useContext(AstryxThemeContext);
