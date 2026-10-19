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

export interface CompetencyScores {
  discourseFluency: number; // 0-100
  syntacticControl: number; // 0-100
  lexicalPrecision: number; // 0-100
  phonologicalControl: number; // 0-100
}

export interface RecommendedPlan {
  id: 'essential' | 'pro' | 'executive';
  name: string;
  priceBob: string;
  priceUsd: string;
  reason: string;
  whatsappMessage?: string;
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
  overallScore?: number; // 0-100
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | string;
  competencies?: CompetencyScores;
  recommendedPlan?: RecommendedPlan;
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
