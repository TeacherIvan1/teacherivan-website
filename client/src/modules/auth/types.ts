export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  country: string;
  authProvider: 'email' | 'google';
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
  authModalMode: 'signup' | 'complete_google_profile';
  pendingGoogleProfile: { email: string; fullName: string } | null;
  isLoading: boolean;
  error: string | null;

  openAuthModal: (mode?: 'signup' | 'complete_google_profile', pending?: { email: string; fullName: string }) => void;
  closeAuthModal: () => void;
  registerWithEmail: (data: { fullName: string; email: string; dateOfBirth: string; country: string }) => Promise<void>;
  authenticateWithGoogle: (data: { email: string; fullName: string; dateOfBirth?: string; country?: string }) => Promise<{ needsProfileCompletion: boolean }>;
  syncWithServer: () => Promise<void>;
  updateUserStats: (cefrLevel: string, lastScore: number) => void;
  signOut: () => void;
}
