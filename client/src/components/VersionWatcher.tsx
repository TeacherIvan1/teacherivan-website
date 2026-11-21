import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    __TI_VOICE_SESSION_ACTIVE__?: boolean;
  }
}

/**
 * Root VersionWatcher Component
 * Periodically checks ./version.json?t=<timestamp> for newly released bundles on GitHub Pages.
 * 
 * Safety features:
 * 1. Safe voice session guard: Defers reload if __TI_VOICE_SESSION_ACTIVE__ is true.
 * 2. SessionStorage loop guard: Prevents infinite reload loops for the same version.
 * 3. Cache purge & SW unregister: Clears CacheStorage and unregisters legacy service workers.
 * 4. Checks on mount, on document visibilitychange, on window focus, and on a 5-minute interval.
 */
export const VersionWatcher: React.FC = () => {
  const pendingVersionRef = useRef<string | null>(null);

  useEffect(() => {
    // Only check in production builds
    if (!import.meta.env.PROD) {
      return;
    }

    const checkVersion = async () => {
      try {
        const res = await fetch(`./version.json?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });
        if (!res.ok) return;

        const data = await res.json();
        const remoteVersion = data?.version;

        if (!remoteVersion || typeof remoteVersion !== 'string') return;

        // If versions match, nothing to update
        if (typeof __APP_VERSION__ !== 'undefined' && remoteVersion === __APP_VERSION__) {
          return;
        }

        // Prevent infinite reload loops for the same version
        const lastReloaded = sessionStorage.getItem('ti_reloaded_for_version');
        if (lastReloaded === remoteVersion) return;

        // Defer reload if a voice session is actively running
        if (typeof window !== 'undefined' && window.__TI_VOICE_SESSION_ACTIVE__) {
          pendingVersionRef.current = remoteVersion;
          return;
        }

        // Apply forced update
        sessionStorage.setItem('ti_reloaded_for_version', remoteVersion);

        // Unregister any legacy or cached service workers
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          } catch {}
        }

        // Clear browser Cache Storage
        if ('caches' in window) {
          try {
            const cacheKeys = await caches.keys();
            for (const key of cacheKeys) {
              await caches.delete(key);
            }
          } catch {}
        }

        // Force reload from server
        window.location.reload();
      } catch {
        // Network offline or fetch failed - silently ignore
      }
    };

    // 1. Initial check on mount
    checkVersion();

    // 2. Check on tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Check on window focus
    window.addEventListener('focus', checkVersion);

    // 4. Poll every 5 minutes (and re-evaluate deferred updates)
    const intervalId = setInterval(() => {
      checkVersion();
    }, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkVersion);
      clearInterval(intervalId);
    };
  }, []);

  return null;
};

export const VersionChecker = VersionWatcher;
export default VersionWatcher;
