import { create } from 'zustand';

export type AppView = 'path' | 'simulator' | 'resources' | 'games' | 'schedule' | 'overview' | 'methodology';

interface NavigationState {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: 'path',
  setActiveView: (activeView: AppView) => {
    set({ activeView });
    // Scroll to top smoothly when switching views
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
