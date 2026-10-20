import { create } from 'zustand';
import { useConversationStore } from '../conversation/conversationStore';

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
  openAssessmentModal: () => {
    const conv = useConversationStore.getState();
    if (conv.status === 'connected' || conv.status === 'connecting' || conv.status === 'requesting_token') {
      conv.stopSession();
    }
    set({ isAssessmentModalOpen: true });
  },
  closeAssessmentModal: () => {
    const conv = useConversationStore.getState();
    if (conv.status === 'connected' || conv.status === 'connecting' || conv.status === 'requesting_token') {
      conv.stopSession();
    }
    set({ isAssessmentModalOpen: false, hasUserDismissedModal: true });
  },
}));
