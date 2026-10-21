import { create } from 'zustand';

export type AppView = 'overview' | 'simulator' | 'resources' | 'games' | 'methodology' | 'schedule';

interface NavigationState {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: 'overview',
  setActiveView: (activeView: AppView) => {
    set({ activeView });
    // Scroll to top smoothly when switching views
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
