export interface ReportStats {
  durationSeconds: number;
  durationFormatted: string;
  learnerTurns: number;
  learnerWords: number;
  estimatedWpm: number;
}

export interface ReportTopError {
  original: string;
  corrected: string;
  explanation: string;
}

export interface SessionReport {
  id: string;
  createdAt: string;
  scenarioTitle: string;
  scenarioCategory: string;
  level: string;
  correctionMode: string;
  summary: string;
  strengths: string[];
  topErrors: ReportTopError[];
  vocabularyUsed: string[];
  nextExercise: string;
  stats: ReportStats;
  pronunciationNote: string;
  modelUsed?: string;
}

export interface ReportRequestPayload {
  turns: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  level: string;
  correctionMode: string;
  scenario: {
    title: string;
    category: string;
    description: string;
    targetVocabulary?: string[];
    targetGrammar?: string[];
  };
  durationSeconds: number;
}

export interface ReportApiResponse {
  success: boolean;
  tooShort?: boolean;
  message?: string;
  rateLimited?: boolean;
  error?: string;
  report?: SessionReport;
}
