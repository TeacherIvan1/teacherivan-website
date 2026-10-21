import { create } from 'zustand';
import { AuthState, UserProfile, LearningGoals } from './types';
import { getApiUrl } from '../../config/api';
import { useDevModeStore } from '../dev/devModeStore';

const USER_STORAGE_KEY = 'teacherivan_auth_user';
const TOKEN_STORAGE_KEY = 'teacherivan_auth_token';

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {}
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {}
}

function getStoredUser(): UserProfile | null {
  try {
    const raw = safeGetItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  return safeGetItem(TOKEN_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialUser = getStoredUser();
  const initialToken = getStoredToken();

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: Boolean(initialUser && initialToken),
    isAuthModalOpen: false,
    authModalMode: 'signup',
    pendingGoogleProfile: null,
    isLoading: false,
    error: null,

    openAuthModal: (mode = 'signup', pending = undefined) => {
      set({
        isAuthModalOpen: true,
        authModalMode: mode,
        pendingGoogleProfile: pending || null,
        error: null,
      });
    },

    closeAuthModal: () => {
      set({
        isAuthModalOpen: false,
        pendingGoogleProfile: null,
        error: null,
      });
    },

    registerWithEmail: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch(getApiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Failed to complete registration');
        }

        const { user, token } = json;
        safeSetItem(USER_STORAGE_KEY, JSON.stringify(user));
        safeSetItem(TOKEN_STORAGE_KEY, token);

        set({
          user,
          token,
          isAuthenticated: true,
          isAuthModalOpen: false,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        set({ isLoading: false, error: msg });
        throw err;
      }
    },

    authenticateWithGoogle: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch(getApiUrl('/api/auth/google'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Google authentication failed');
        }

        if (json.needsProfileCompletion) {
          set({
            isLoading: false,
            authModalMode: 'complete_google_profile',
            pendingGoogleProfile: {
              email: data.email,
              fullName: data.fullName,
            },
            error: null,
          });
          return { needsProfileCompletion: true };
        }

        const { user, token } = json;
        safeSetItem(USER_STORAGE_KEY, JSON.stringify(user));
        safeSetItem(TOKEN_STORAGE_KEY, token);

        set({
          user,
          token,
          isAuthenticated: true,
          isAuthModalOpen: false,
          isLoading: false,
          pendingGoogleProfile: null,
          error: null,
        });
        return { needsProfileCompletion: false };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        set({ isLoading: false, error: msg });
        throw err;
      }
    },

    loginWithCredentials: async (data: { email: string; password?: string }) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Login failed. Please check credentials.');
        }

        const { user, token } = json;
        safeSetItem(USER_STORAGE_KEY, JSON.stringify(user));
        safeSetItem(TOKEN_STORAGE_KEY, token);

        set({
          user,
          token,
          isAuthenticated: true,
          isAuthModalOpen: false,
          isLoading: false,
          error: null,
        });

        return user;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        set({ isLoading: false, error: msg });
        throw err;
      }
    },

    saveProfileGoals: async (goals: LearningGoals) => {
      const { user } = get();
      if (!user) throw new Error('Not authenticated');

      set({ isLoading: true, error: null });
      try {
        const res = await fetch(getApiUrl('/api/auth/profile'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            learningGoals: goals,
            cefrLevel: goals.targetLevel,
          }),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Failed to update profile');
        }

        const updatedUser: UserProfile = json.user || {
          ...user,
          learningGoals: goals,
          profileCompleted: true,
          cefrLevel: goals.targetLevel,
        };

        safeSetItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        set({
          user: updatedUser,
          isLoading: false,
          error: null,
        });

        return updatedUser;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        set({ isLoading: false, error: msg });
        throw err;
      }
    },

    syncWithServer: async () => {
      const { user } = get();
      if (!user || !user.email) return;

      try {
        const res = await fetch(getApiUrl('/api/auth/sync'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.user && json.token) {
            safeSetItem(USER_STORAGE_KEY, JSON.stringify(json.user));
            safeSetItem(TOKEN_STORAGE_KEY, json.token);
            set({ user: json.user, token: json.token });
          }
        }
      } catch (err) {
        // Non-blocking sync failure on offline / sleep
      }
    },

    updateUserStats: (cefrLevel: string, lastScore: number) => {
      const { user } = get();
      if (!user) return;

      const updated: UserProfile = {
        ...user,
        cefrLevel,
        lastScore,
      };

      safeSetItem(USER_STORAGE_KEY, JSON.stringify(updated));
      set({ user: updated });

      // Background sync with server
      get().syncWithServer().catch(() => {});
    },

    signOut: () => {
      safeRemoveItem(USER_STORAGE_KEY);
      safeRemoveItem(TOKEN_STORAGE_KEY);
      // Strictly disable dev mode on sign out
      useDevModeStore.getState().setDeveloperMode(false);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAuthModalOpen: false,
        pendingGoogleProfile: null,
      });
    },
  };
});
