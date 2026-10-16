import { create } from 'zustand';
import { SessionReport, ReportRequestPayload } from './types';
import {
  requestReportGeneration,
  isSessionTooShort,
  calculateClientStats,
} from './reportService';
import {
  saveReportToIndexedDB,
  getAllReportsFromIndexedDB,
  deleteReportFromIndexedDB,
  deleteAllReportsFromIndexedDB,
} from './reportStorage';

interface ReportState {
  reportsEnabled: boolean;
  currentReport: SessionReport | null;
  isGenerating: boolean;
  error: string | null;
  isRateLimited: boolean;
  tooShortNotice: string | null;
  lastPayload: ReportRequestPayload | null;
  savedReports: SessionReport[];
  isHistoryOpen: boolean;

  // Actions
  setReportsEnabled: (enabled: boolean) => void;
  loadSavedReports: () => Promise<void>;
  generateReport: (payload: ReportRequestPayload) => Promise<void>;
  retryGeneration: () => Promise<void>;
  dismissReport: () => void;
  deleteReport: (id: string) => Promise<void>;
  deleteAllReports: () => Promise<void>;
  setHistoryOpen: (open: boolean) => void;
  viewReport: (report: SessionReport) => void;
}

const SETTINGS_KEY = 'gemini_live_reports_enabled';

function getStoredReportsEnabled(): boolean {
  try {
    const val = localStorage.getItem(SETTINGS_KEY);
    if (val !== null) {
      return val === 'true';
    }
  } catch {}
  return true;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reportsEnabled: getStoredReportsEnabled(),
  currentReport: null,
  isGenerating: false,
  error: null,
  isRateLimited: false,
  tooShortNotice: null,
  lastPayload: null,
  savedReports: [],
  isHistoryOpen: false,

  setReportsEnabled: (enabled: boolean) => {
    try {
      localStorage.setItem(SETTINGS_KEY, String(enabled));
    } catch {}
    set({ reportsEnabled: enabled });
  },

  loadSavedReports: async () => {
    const reports = await getAllReportsFromIndexedDB();
    set({ savedReports: reports });
  },

  generateReport: async (payload: ReportRequestPayload) => {
    if (!get().reportsEnabled) {
      return;
    }

    set({
      lastPayload: payload,
      isGenerating: true,
      error: null,
      isRateLimited: false,
      tooShortNotice: null,
    });

    // Check early on client
    const stats = calculateClientStats(payload.turns, payload.durationSeconds);
    if (isSessionTooShort(stats.learnerTurns, stats.learnerWords)) {
      set({
        isGenerating: false,
        tooShortNotice:
          'This session was too short to generate a detailed report. Practice for at least 2 conversational turns (8+ words) to receive personalized feedback!',
      });
      return;
    }

    const response = await requestReportGeneration(payload);

    if (response.rateLimited) {
      set({
        isGenerating: false,
        isRateLimited: true,
        error: response.error || 'Gemini API rate limit reached. Please wait a moment and click Retry.',
      });
      return;
    }

    if (!response.success || response.error) {
      set({
        isGenerating: false,
        error: response.error || 'Failed to generate report from session.',
      });
      return;
    }

    if (response.tooShort) {
      set({
        isGenerating: false,
        tooShortNotice:
          response.message ||
          'This session was too short to generate a detailed report. Practice speaking for a few turns to receive feedback!',
      });
      return;
    }

    if (response.report) {
      // Save report in IndexedDB
      await saveReportToIndexedDB(response.report);
      const updatedReports = await getAllReportsFromIndexedDB();

      set({
        isGenerating: false,
        currentReport: response.report,
        savedReports: updatedReports,
        error: null,
      });
    }
  },

  retryGeneration: async () => {
    const { lastPayload } = get();
    if (lastPayload) {
      await get().generateReport(lastPayload);
    }
  },

  dismissReport: () => {
    set({
      currentReport: null,
      error: null,
      tooShortNotice: null,
      isRateLimited: false,
    });
  },

  deleteReport: async (id: string) => {
    await deleteReportFromIndexedDB(id);
    const updated = await getAllReportsFromIndexedDB();
    set((state) => ({
      savedReports: updated,
      currentReport: state.currentReport?.id === id ? null : state.currentReport,
    }));
  },

  deleteAllReports: async () => {
    await deleteAllReportsFromIndexedDB();
    set({
      savedReports: [],
      currentReport: null,
    });
  },

  setHistoryOpen: (open: boolean) => {
    set({ isHistoryOpen: open });
  },

  viewReport: (report: SessionReport) => {
    set({
      currentReport: report,
      tooShortNotice: null,
      error: null,
    });
  },
}));
