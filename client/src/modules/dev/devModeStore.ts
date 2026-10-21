import { create } from 'zustand';

const STORAGE_KEY = 'teacherivan_dev_mode';

function getInitialDevMode(): boolean {
  if (typeof window !== 'undefined') {
    try {
      // NOTE: Public ?dev=true URL activation is strictly DISABLED for guests and regular students.
      // Dev Mode is exclusively reserved for Teacher Ivan's admin session.
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {
      // Ignore storage errors
    }
  }
  return false;
}

interface DevModeState {
  isDeveloperMode: boolean;
  setDeveloperMode: (enabled: boolean) => void;
  toggleDeveloperMode: () => void;
}

export const useDevModeStore = create<DevModeState>((set, get) => ({
  isDeveloperMode: getInitialDevMode(),

  setDeveloperMode: (enabled: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {}
    set({ isDeveloperMode: enabled });
  },

  toggleDeveloperMode: () => {
    const next = !get().isDeveloperMode;
    get().setDeveloperMode(next);
  },
}));

if (typeof window !== 'undefined') {
  (window as unknown as { useDevModeStore: typeof useDevModeStore }).useDevModeStore = useDevModeStore;
}
