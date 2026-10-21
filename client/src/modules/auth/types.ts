export interface LearningGoals {
  targetLevel: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1 / IELTS'
  primaryGoal: string; // 'Tech & Job Interviews' | 'University Scholarship' | 'IELTS Exam Prep' | 'Business & Executive English' | 'Daily Conversational Fluency'
  focusSkill: string;  // 'Speaking Fluency & Pronunciation' | 'Grammar & Syntax Accuracy' | 'Professional Vocabulary & Collocations' | 'Listening Comprehension'
  personalObjective: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  country: string;
  authProvider: 'email' | 'google';
  role?: 'student' | 'admin';
  profileCompleted?: boolean;
  learningGoals?: LearningGoals;
  cefrLevel?: string;
  lastScore?: number;
  createdAt: string;
}

export const SUPPORTED_COUNTRIES = [
  'Bolivia',
  'Mexico',
  'Colombia',
  'Peru',
  'Argentina',
  'Chile',
  'Spain',
  'USA',
  'Other',
] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signup' | 'signin' | 'complete_google_profile';
  pendingGoogleProfile: { email: string; fullName: string } | null;
  isLoading: boolean;
  error: string | null;

  openAuthModal: (mode?: 'signup' | 'signin' | 'complete_google_profile', pending?: { email: string; fullName: string }) => void;
  closeAuthModal: () => void;
  registerWithEmail: (data: { fullName: string; email: string; dateOfBirth: string; country: string }) => Promise<void>;
  authenticateWithGoogle: (data: { email: string; fullName: string; dateOfBirth?: string; country?: string }) => Promise<{ needsProfileCompletion: boolean }>;
  loginWithCredentials: (data: { email: string; password?: string }) => Promise<UserProfile>;
  saveProfileGoals: (goals: LearningGoals) => Promise<UserProfile>;
  syncWithServer: () => Promise<void>;
  updateUserStats: (cefrLevel: string, lastScore: number) => void;
  signOut: () => void;
}
