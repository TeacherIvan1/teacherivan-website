import { create } from 'zustand';

interface AssessmentState {
  isAssessmentModalOpen: boolean;
  hasUserDismissedModal: boolean;
  openAssessmentModal: () => void;
  closeAssessmentModal: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  // Auto-pop-up on website entry as required
  isAssessmentModalOpen: true,
  hasUserDismissedModal: false,
  openAssessmentModal: () => set({ isAssessmentModalOpen: true }),
  closeAssessmentModal: () => set({ isAssessmentModalOpen: false, hasUserDismissedModal: true }),
}));
