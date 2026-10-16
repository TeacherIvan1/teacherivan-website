import { create } from 'zustand';
import { TeachingState, LearnerLevel, CorrectionMode, LessonScenario, TutorSettings } from './types';
import { buildSystemInstruction } from './instructionBuilder';

export const INITIAL_SCENARIOS: LessonScenario[] = [
  {
    id: 'travel-airport',
    title: 'Airport Check-In & Customs',
    category: 'Travel & Navigation',
    description: 'Practice checking luggage, navigating security, and answering customs inquiries naturally.',
    targetGrammar: ['Modal verbs (could, would, might)', 'Past simple vs. Present perfect'],
    targetVocabulary: ['Boarding pass', 'Carry-on', 'Declaration', 'Layover', 'Gate change'],
  },
  {
    id: 'job-interview',
    title: 'Software Developer Job Interview',
    category: 'Career & Professional',
    description: 'Articulate your strengths, past projects, problem-solving methods, and ask insightful questions.',
    targetGrammar: ['STAR method sentence connectors', 'Conditional structures for hypothetical scenarios'],
    targetVocabulary: ['Scalability', 'Trade-offs', 'Cross-functional', 'Milestone', 'Refactoring'],
  },
  {
    id: 'casual-coffee',
    title: 'Weekend Plans & Casual Small Talk',
    category: 'Everyday Conversation',
    description: 'Learn idiomatic expressions, conversational fillers, and keep dialogues flowing effortlessly.',
    targetGrammar: ['Tag questions (isn\'t it?, don\'t you?)', 'Future intentions (going to vs. will)'],
    targetVocabulary: ['Catch up', 'Grab a bite', 'Low-key', 'Up to much', 'Down to earth'],
  },
];

export const useTeachingStore = create<TeachingState>((set, get) => ({
  level: 'intermediate',
  correctionMode: 'coaching',
  selectedScenarioId: 'casual-coffee',
  availableScenarios: INITIAL_SCENARIOS,
  activeInstruction: null,
  isLocked: false,

  setLevel: (level: LearnerLevel) => {
    if (get().isLocked) return;
    set({ level });
  },

  setCorrectionMode: (mode: CorrectionMode) => {
    if (get().isLocked) return;
    set({ correctionMode: mode });
  },

  selectScenario: (scenarioId: string) => {
    if (get().isLocked) return;
    set({ selectedScenarioId: scenarioId });
  },
  setCustomExerciseScenario: (exerciseText: string) => {
    if (get().isLocked) return;
    const customId = `exercise-${Date.now()}`;
    const baseScenario = get().getSettings().scenario;
    const cleanTitle = exerciseText.length > 35 ? `${exerciseText.slice(0, 32)}...` : exerciseText;
    const exerciseScenario: LessonScenario = {
      id: customId,
      title: `Practice: ${cleanTitle}`,
      category: 'Targeted Follow-up',
      description: `Follow-up exercise from previous session: ${exerciseText}`,
      targetGrammar: baseScenario?.targetGrammar || [],
      targetVocabulary: baseScenario?.targetVocabulary || [],
    };
    set((state) => ({
      availableScenarios: [
        exerciseScenario,
        ...state.availableScenarios.filter((s) => !s.id.startsWith('exercise-')),
      ],
      selectedScenarioId: customId,
    }));
  },

  lockSettings: (instruction: string) => {
    set({
      isLocked: true,
      activeInstruction: instruction,
    });
  },

  unlockSettings: () => {
    set({
      isLocked: false,
    });
  },

  getSettings: (): TutorSettings => {
    const { level, correctionMode, selectedScenarioId, availableScenarios } = get();
    const scenario =
      availableScenarios.find((s) => s.id === selectedScenarioId) || availableScenarios[0];

    return {
      level,
      correctionMode,
      scenario,
    };
  },
}));

// Re-export pure builder and types for external consumers
export { buildSystemInstruction };
export * from './types';
