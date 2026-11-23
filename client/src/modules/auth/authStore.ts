import { create } from 'zustand';
import { AuthState, UserProfile, LearningGoals, StudentPlan } from './types';
import { getApiUrl } from '../../config/api';
import { useDevModeStore } from '../dev/devModeStore';
import { getStudentBookingsCache, saveStudentBookingsCache } from './vaultSync';
import { trackEvent } from '../../utils/analytics';

const USER_STORAGE_KEY = 'teacherivan_auth_user';

const LEGACY_TOKEN_KEYS = [
  'teacherivan_auth_token',
  'ti_token',
  'auth_token',
  'token',
  'jwt',
  'access_token',
];

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
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  } catch {}
}

/**
 * Proactively purges any legacy JWT/auth token keys from localStorage and sessionStorage
 * so returning browsers are 100% free of client-side token persistence.
 */
export function purgeLegacyAuthTokens(): void {
  for (const key of LEGACY_TOKEN_KEYS) {
    safeRemoveItem(key);
  }
}

function getStoredUser(): UserProfile | null {
  try {
    purgeLegacyAuthTokens();
    const raw = safeGetItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialUser = getStoredUser();

  return {
    user: initialUser,
    token: null, // Strictly null: session is managed via HttpOnly `ti_session` cookie
    isAuthenticated: Boolean(initialUser),
    isAuthModalOpen: false,
    authModalMode: 'signup',
    authModalBanner: null,
    pendingGoogleProfile: null,
    pendingPlanModal: null,
    isLoading: false,
    error: null,

    openAuthModal: (mode = 'signup', pending = undefined, banner = null) => {
      set({
        isAuthModalOpen: true,
        authModalMode: mode,
        authModalBanner: banner || null,
        pendingGoogleProfile: pending || null,
        error: null,
      });
    },

    closeAuthModal: () => {
      set({
        isAuthModalOpen: false,
        authModalBanner: null,
        pendingGoogleProfile: null,
        error: null,
      });
    },

    registerWithEmail: async (data) => {
      set({ isLoading: true, error: null });
      try {
        purgeLegacyAuthTokens();
        const res = await fetch(getApiUrl('/api/auth/register'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Failed to complete registration');
        }

        const { user } = json;
        safeSetItem(USER_STORAGE_KEY, JSON.stringify(user));
        trackEvent('sign_up', { method: 'email' });

        set({
          user,
          token: null,
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
        purgeLegacyAuthTokens();
        const res = await fetch(getApiUrl('/api/auth/google'), {
          method: 'POST',
          credentials: 'include',
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
              email: json.user?.email || data.email || '',
              fullName: json.user?.fullName || data.fullName || '',
            },
            error: null,
          });
          return { needsProfileCompletion: true, user: json.user };
        }

        const { user } = json;
        safeSetItem(USER_STORAGE_KEY, JSON.stringify(user));
        trackEvent('sign_up', { method: 'google' });

        set({
          user,
          token: null,
          isAuthenticated: true,
          isAuthModalOpen: false,
          isLoading: false,
          pendingGoogleProfile: null,
          error: null,
        });
        return { needsProfileCompletion: false, user };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        set({ isLoading: false, error: msg });
        throw err;
      }
    },

    loginWithCredentials: async (data: {
      username?: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
    }) => {
      set({ isLoading: true, error: null });
      try {
        purgeLegacyAuthTokens();
        const payload = {
          username: data.username || data.email,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
        };
        const res = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Login failed. Please check credentials.');
        }

        const { user } = json;
        safeSetItem(USER_STORAGE_KEY, JSON.stringify(user));

        set({
          user,
          token: null,
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

    recoverPassword: async (data: {
      username: string;
      verificationContact: string;
      newPassword: string;
    }) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch(getApiUrl('/api/auth/recover-password'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Password recovery failed');
        }

        set({ isLoading: false, error: null });
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
          credentials: 'include',
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
      purgeLegacyAuthTokens();
      const { user } = get();

      try {
        let serverUser: UserProfile | null = null;
        const meUrl = user?.id || user?.email
          ? getApiUrl(`/api/auth/me?userId=${encodeURIComponent(user.id || user.email)}`)
          : getApiUrl('/api/auth/me');

        const resMe = await fetch(meUrl, {
          method: 'GET',
          credentials: 'include',
        });
        if (resMe.ok) {
          const jsonMe = await resMe.json();
          if (jsonMe.user) serverUser = jsonMe.user;
        }

        const cachedBookings = getStudentBookingsCache();
        if (!serverUser && user && user.email) {
          const resSync = await fetch(getApiUrl('/api/auth/sync'), {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, bookings: cachedBookings }),
          });
          if (resSync.ok) {
            const jsonSync = await resSync.json();
            if (jsonSync.user) serverUser = jsonSync.user;
            if (Array.isArray(jsonSync.bookings) && jsonSync.bookings.length > 0) {
              saveStudentBookingsCache(jsonSync.bookings);
            }
          }
        } else if (serverUser && cachedBookings.length > 0) {
          fetch(getApiUrl('/api/auth/sync'), {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: serverUser, bookings: cachedBookings }),
          })
            .then(async (r) => {
              if (r.ok) {
                const j = await r.json();
                if (Array.isArray(j.bookings)) saveStudentBookingsCache(j.bookings);
              }
            })
            .catch(() => {});
        }

        if (serverUser) {
          const currentPlan = serverUser.plan || 'free';
          const ackKey = `ti_ack_plan_${serverUser.id}`;
          const planVersion = `${currentPlan}_${serverUser.planUpdatedAt || ''}`;
          const isAcked = safeGetItem(ackKey) === planVersion;

          safeSetItem(USER_STORAGE_KEY, JSON.stringify(serverUser));
          set({
            user: serverUser,
            token: null,
            isAuthenticated: true,
          });

          if (currentPlan !== 'free' && (serverUser.planNotificationPending === true || !isAcked)) {
            set({
              pendingPlanModal: {
                plan: currentPlan,
                planUpdatedAt: serverUser.planUpdatedAt,
              },
            });
          }
        }
      } catch {
        // Non-blocking sync failure on offline / sleep
      }
    },

    ackPlanNotification: async () => {
      const { user } = get();
      if (!user) return;
      const currentPlan = user.plan || 'free';
      const ackKey = `ti_ack_plan_${user.id}`;
      const planVersion = `${currentPlan}_${user.planUpdatedAt || ''}`;
      safeSetItem(ackKey, planVersion);

      const updatedUser: UserProfile = { ...user, planNotificationPending: false };
      safeSetItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      set({ pendingPlanModal: null, user: updatedUser });

      try {
        await fetch(getApiUrl('/api/auth/ack-plan-notification'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id, email: user.email }),
        });
      } catch {}
    },

    dismissPlanModal: () => {
      const { user } = get();
      if (user) {
        const currentPlan = user.plan || 'free';
        const ackKey = `ti_ack_plan_${user.id}`;
        const planVersion = `${currentPlan}_${user.planUpdatedAt || ''}`;
        safeSetItem(ackKey, planVersion);
      }
      set({ pendingPlanModal: null });
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

      get().syncWithServer().catch(() => {});
    },

    updateUserPlan: async (userId: string, plan: StudentPlan) => {
      const res = await fetch(getApiUrl(`/api/users/${userId}/plan`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update user plan');
      }

      const updatedUser: UserProfile = data.user;
      const currentUser = get().user;
      if (currentUser && currentUser.id === userId) {
        safeSetItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
      return updatedUser;
    },

    checkAndIncrementSessionQuota: () => {
      const { user } = get();
      const todayIso = new Date().toISOString().split('T')[0];

      if (!user) {
        const guestDateKey = 'teacherivan_guest_session_date';
        const guestUsedKey = 'teacherivan_guest_session_used';
        const lastDate = safeGetItem(guestDateKey);
        let used = parseInt(safeGetItem(guestUsedKey) || '0', 10);
        if (lastDate !== todayIso) {
          used = 0;
          safeSetItem(guestDateKey, todayIso);
        }
        if (used >= 5) {
          return { allowed: false, remaining: 0, used, max: 5 };
        }
        used += 1;
        safeSetItem(guestUsedKey, String(used));
        return { allowed: true, remaining: 5 - used, used, max: 5 };
      }

      const plan = user.plan || (user.role === 'admin' ? 'executive' : 'free');
      let max = user.maxDailySessions !== undefined ? user.maxDailySessions : (plan === 'free' ? 5 : -1);
      if (user.role === 'admin' || plan === 'essential' || plan === 'pro' || plan === 'executive') {
        max = -1;
      }

      let used = user.dailySessionsUsed || 0;
      if (user.lastSessionDate !== todayIso) {
        used = 0;
      }

      if (max !== -1 && used >= max) {
        return { allowed: false, remaining: 0, used, max };
      }

      const newUsed = used + 1;
      const updatedUser: UserProfile = {
        ...user,
        dailySessionsUsed: newUsed,
        lastSessionDate: todayIso,
      };

      safeSetItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });

      return {
        allowed: true,
        remaining: max === -1 ? 'unlimited' : Math.max(0, max - newUsed),
        used: newUsed,
        max,
      };
    },

    signOut: () => {
      safeRemoveItem(USER_STORAGE_KEY);
      purgeLegacyAuthTokens();
      useDevModeStore.getState().setDeveloperMode(false);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAuthModalOpen: false,
        pendingGoogleProfile: null,
        pendingPlanModal: null,
      });

      try {
        if (typeof fetch === 'function') {
          fetch(getApiUrl('/api/auth/logout'), {
            method: 'POST',
            credentials: 'include',
          }).catch(() => {});
        }
      } catch {}
    },
  };
});
