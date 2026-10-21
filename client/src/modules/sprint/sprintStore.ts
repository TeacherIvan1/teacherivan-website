import { create } from 'zustand';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type ScenarioId = 'daily-routine' | 'scholarship-interview' | 'tech-interview' | 'ielts-academic';
export type Competency = 'Discourse Fluency' | 'Syntactic Control' | 'Lexical Precision' | 'Phonological Control';

export interface StudentProfile {
  studentName: string;
  cefrLevel: CEFRLevel;
  focusScenario: ScenarioId;
  weakCompetency: Competency;
}

export interface GameResult {
  bestScore: number;
  accuracy: number;
  timesPlayed: number;
}

interface SprintState {
  // Student Profile
  profile: StudentProfile;

  // 5-Day Sprint Progress (day index 0 to 4)
  completedStages: number[];
  completedReadings: string[];
  completedVideos: string[];
  gameResults: Record<string, GameResult>;
  totalXp: number;

  // Day 4 Written Production
  day4Writing: string;
  day4Feedback: string | null;

  // AI Tailored 5-Day Sprint
  personalizedSprint?: {
    targetLevel: string;
    primaryGoal: string;
    focusSkill: string;
    personalObjective: string;
    days: Array<{
      day: 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
      type: 'Receptive Input' | 'Structural Processing' | 'Async Oral Production' | 'Functional Writing Prompt' | 'Weekly Closure';
      title: string;
      time: string;
      description: string;
      targetCollocations: string[];
      simulatorScenarioPreset: string;
      functionalWritingPrompt?: string;
      highlight: string;
    }>;
    generatedBy?: 'gemini' | 'deterministic-fallback';
    modelUsed?: string;
  };

  // Report Modal State
  isReportModalOpen: boolean;

  // Actions
  updateProfile: (profile: Partial<StudentProfile>) => void;
  setPersonalizedSprint: (sprint: any) => void;
  completeStage: (stageIndex: number) => void;
  markReadingComplete: (readingId: string) => void;
  markVideoComplete: (videoId: string) => void;
  recordGameResult: (gameId: string, accuracy: number, score: number, xp: number) => void;
  saveDay4Writing: (writing: string, feedback?: string) => void;
  openReportModal: () => void;
  closeReportModal: () => void;
  resetSprintWeek: () => void;
}

const STORAGE_KEY = 'teacherivan_sprint_state';

function loadPersistedState(): Partial<SprintState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore storage parse error
  }
  return {};
}

function persistState(state: Partial<SprintState>) {
  try {
    const toSave = {
      profile: state.profile,
      personalizedSprint: state.personalizedSprint,
      completedStages: state.completedStages,
      completedReadings: state.completedReadings,
      completedVideos: state.completedVideos,
      gameResults: state.gameResults,
      totalXp: state.totalXp,
      day4Writing: state.day4Writing,
      day4Feedback: state.day4Feedback,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore storage write error
  }
}

const initialSaved = loadPersistedState();

export const useSprintStore = create<SprintState>((set, get) => ({
  profile: initialSaved.profile || {
    studentName: 'Estudiante',
    cefrLevel: 'B1',
    focusScenario: 'tech-interview',
    weakCompetency: 'Syntactic Control',
  },
  personalizedSprint: initialSaved.personalizedSprint,
  completedStages: initialSaved.completedStages || [],
  completedReadings: initialSaved.completedReadings || [],
  completedVideos: initialSaved.completedVideos || [],
  gameResults: initialSaved.gameResults || {},
  totalXp: initialSaved.totalXp || 150,
  day4Writing: initialSaved.day4Writing || '',
  day4Feedback: initialSaved.day4Feedback || null,
  isReportModalOpen: false,

  updateProfile: (newProfile) => {
    set((s) => {
      const updated = { profile: { ...s.profile, ...newProfile } };
      persistState({ ...s, ...updated });
      return updated;
    });
  },

  setPersonalizedSprint: (sprint: any) => {
    set((s) => {
      const updated = { personalizedSprint: sprint };
      persistState({ ...s, ...updated });
      return updated;
    });
  },

  completeStage: (stageIndex: number) => {
    set((s) => {
      if (s.completedStages.includes(stageIndex)) return s;
      const updatedStages = [...s.completedStages, stageIndex].sort();
      const updated = {
        completedStages: updatedStages,
        totalXp: s.totalXp + 50,
      };
      persistState({ ...s, ...updated });
      return updated;
    });
  },

  markReadingComplete: (readingId: string) => {
    set((s) => {
      const updatedReadings = s.completedReadings.includes(readingId)
        ? s.completedReadings
        : [...s.completedReadings, readingId];

      // Completing a reading also completes Day 1 stage
      const updatedStages = s.completedStages.includes(0)
        ? s.completedStages
        : [...s.completedStages, 0].sort();

      const updated = {
        completedReadings: updatedReadings,
        completedStages: updatedStages,
        totalXp: s.totalXp + 40,
      };
      persistState({ ...s, ...updated });
      return updated;
    });
  },

  markVideoComplete: (videoId: string) => {
    set((s) => {
      const updatedVideos = s.completedVideos.includes(videoId)
        ? s.completedVideos
        : [...s.completedVideos, videoId];

      // Completing a video also completes Day 1 stage
      const updatedStages = s.completedStages.includes(0)
        ? s.completedStages
        : [...s.completedStages, 0].sort();

      const updated = {
        completedVideos: updatedVideos,
        completedStages: updatedStages,
        totalXp: s.totalXp + 40,
      };
      persistState({ ...s, ...updated });
      return updated;
    });
  },

  recordGameResult: (gameId: string, accuracy: number, score: number, xp: number) => {
    set((s) => {
      const existing = s.gameResults[gameId] || { bestScore: 0, accuracy: 0, timesPlayed: 0 };
      const updatedGame: GameResult = {
        bestScore: Math.max(existing.bestScore, score),
        accuracy: Math.max(existing.accuracy, accuracy),
        timesPlayed: existing.timesPlayed + 1,
      };

      // Completing any game completes Day 2 stage
      const updatedStages = s.completedStages.includes(1)
        ? s.completedStages
        : [...s.completedStages, 1].sort();

      const updated = {
        gameResults: {
          ...s.gameResults,
          [gameId]: updatedGame,
        },
        completedStages: updatedStages,
        totalXp: s.totalXp + xp,
      };
      persistState({ ...s, ...updated });
      return updated;
    });
  },

  saveDay4Writing: (writing: string, feedback?: string) => {
    set((s) => {
      // Saving writing completes Day 4 stage (index 3)
      const updatedStages = s.completedStages.includes(3)
        ? s.completedStages
        : [...s.completedStages, 3].sort();

      const updated = {
        day4Writing: writing,
        day4Feedback: feedback || null,
        completedStages: updatedStages,
        totalXp: s.totalXp + 60,
      };
      persistState({ ...s, ...updated });
      return updated;
    });
  },

  openReportModal: () => set({ isReportModalOpen: true }),
  closeReportModal: () => set({ isReportModalOpen: false }),

  resetSprintWeek: () => {
    const fresh = {
      completedStages: [],
      completedReadings: [],
      completedVideos: [],
      day4Writing: '',
      day4Feedback: null,
      isReportModalOpen: false,
    };
    persistState({ ...get(), ...fresh });
    set(fresh);
  },
}));
