export type LearnerLevel = 'beginner' | 'intermediate' | 'advanced';
export type CorrectionMode = 'conversation' | 'coaching';
export type TutorPersona = 'teacher-ivan' | 'emma';

export interface LessonScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  targetGrammar: string[];
  targetVocabulary: string[];
}

export interface TutorSettings {
  level: LearnerLevel;
  correctionMode: CorrectionMode;
  scenario: LessonScenario;
  persona?: TutorPersona;
  targetVocabulary?: string[];
  grammarFocus?: string[];
}

export interface TeachingState {
  level: LearnerLevel;
  correctionMode: CorrectionMode;
  persona: TutorPersona;
  selectedScenarioId: string;
  availableScenarios: LessonScenario[];
  activeInstruction: string | null;
  isLocked: boolean;

  // Actions
  setLevel: (level: LearnerLevel) => void;
  setCorrectionMode: (mode: CorrectionMode) => void;
  setPersona: (persona: TutorPersona) => void;
  selectScenario: (scenarioId: string) => void;
  setCustomExerciseScenario: (exerciseText: string) => void;
  lockSettings: (instruction: string) => void;
  unlockSettings: () => void;
  getSettings: () => TutorSettings;
}

