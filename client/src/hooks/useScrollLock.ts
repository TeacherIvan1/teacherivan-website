import { useEffect } from 'react';

let activeLockCount = 0;

/**
 * Global Modal Scroll Lock Hook (`client/src/hooks/useScrollLock.ts`)
 * -------------------------------------------------------------------
 * Cleanly locks background page scroll (both native DOM overflow and Lenis smooth-scroll)
 * whenever any modal (`AuthModal`, `PrivacyPolicyModal`, `CookiePolicyModal`, `ReportModal`)
 * or mobile navigation drawer is open.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    activeLockCount++;
    if (activeLockCount === 1) {
      window.__lenis?.stop?.();
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);
      if (activeLockCount === 0) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        window.__lenis?.start?.();
      }
    };
  }, [isLocked]);
}

export default useScrollLock;
