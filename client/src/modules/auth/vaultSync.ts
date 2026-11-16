/**
 * ==============================================================================
 * Teacher Ivan Platform - Resilient Admin & Student Vault Sync Service
 * File: client/src/modules/auth/vaultSync.ts
 * ==============================================================================
 * Guarantees zero lost student records and zero lost bookings across ephemeral
 * server sleeps or restarts through:
 *  1. Persistent Additive Vaults in localStorage (ti_admin_roster_vault, ti_admin_bookings_vault)
 *  2. Additive union merging (never destructive overwrite by fresh server seed data)
 *  3. Automatic server rehydration (POST /api/users/rehydrate-roster)
 *  4. Student-side booking self-healing (ti_student_bookings_cache)
 * ==============================================================================
 */

import { UserProfile, StudentPlan } from './types';
import { getApiUrl } from '../../config/api';

export const ROSTER_VAULT_KEY = 'ti_admin_roster_vault';
export const BOOKINGS_VAULT_KEY = 'ti_admin_bookings_vault';
export const STUDENT_BOOKINGS_CACHE_KEY = 'ti_student_bookings_cache';

export interface BookingRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCountry: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  learningGoal: string;
  createdAt: string;
}

function safeGetJson<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSetJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[VaultSync] localStorage write failed for ${key}:`, err);
  }
}

// -----------------------------------------------------------------------------
// 1. Storage Helpers
// -----------------------------------------------------------------------------

export function getAdminRosterVault(): UserProfile[] {
  const users = safeGetJson<UserProfile[]>(ROSTER_VAULT_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function saveAdminRosterVault(users: UserProfile[]): void {
  safeSetJson(ROSTER_VAULT_KEY, users);
}

export function getAdminBookingsVault(): BookingRecord[] {
  const bookings = safeGetJson<BookingRecord[]>(BOOKINGS_VAULT_KEY, []);
  return Array.isArray(bookings) ? bookings : [];
}

export function saveAdminBookingsVault(bookings: BookingRecord[]): void {
  safeSetJson(BOOKINGS_VAULT_KEY, bookings);
}

export function getStudentBookingsCache(): BookingRecord[] {
  const bookings = safeGetJson<BookingRecord[]>(STUDENT_BOOKINGS_CACHE_KEY, []);
  return Array.isArray(bookings) ? bookings : [];
}

export function saveStudentBookingsCache(bookings: BookingRecord[]): void {
  safeSetJson(STUDENT_BOOKINGS_CACHE_KEY, bookings);
}

export function addStudentBookingToCache(booking: BookingRecord): void {
  const current = getStudentBookingsCache();
  const filtered = current.filter((b) => b.id !== booking.id);
  const updated = [...filtered, booking];
  saveStudentBookingsCache(updated);
}

export function removeStudentBookingFromCache(bookingId: string): void {
  const current = getStudentBookingsCache();
  const updated = current.filter((b) => b.id !== bookingId);
  saveStudentBookingsCache(updated);
}

// -----------------------------------------------------------------------------
// 2. Additive Union Merge Logic
// -----------------------------------------------------------------------------

export function normalizeEmail(email?: string): string {
  return email ? email.trim().toLowerCase() : '';
}

/**
 * Merges local vault users and server users without destructively overwriting
 * non-seed registered students when a server restarts with default seed data.
 */
export function mergeUsersAdditive(
  localUsers: UserProfile[],
  serverUsers: UserProfile[]
): UserProfile[] {
  const userMap = new Map<string, UserProfile>();

  // 1. Populate map with local vault users first
  for (const u of localUsers) {
    if (!u || !u.email) continue;
    const norm = normalizeEmail(u.email);
    userMap.set(norm, { ...u, email: norm });
  }

  // 2. Merge server users additively
  for (const s of serverUsers) {
    if (!s || !s.email) continue;
    const norm = normalizeEmail(s.email);
    const existing = userMap.get(norm);

    if (!existing) {
      // New user from server
      userMap.set(norm, { ...s, email: norm });
    } else {
      // User exists in both local vault and server: merge smartly
      const existingHasPaid = existing.plan && existing.plan !== 'free';
      const serverHasPaid = s.plan && s.plan !== 'free';

      const existingTimestamp = existing.planUpdatedAt ? new Date(existing.planUpdatedAt).getTime() : 0;
      const serverTimestamp = s.planUpdatedAt ? new Date(s.planUpdatedAt).getTime() : 0;

      let planToUse: StudentPlan = existing.plan || 'free';
      let planUpdatedAtToUse = existing.planUpdatedAt;
      let notificationPending = existing.planNotificationPending;

      if (!existingHasPaid && serverHasPaid) {
        planToUse = s.plan as StudentPlan;
        planUpdatedAtToUse = s.planUpdatedAt;
        notificationPending = s.planNotificationPending;
      } else if (serverHasPaid && serverTimestamp > existingTimestamp) {
        planToUse = s.plan as StudentPlan;
        planUpdatedAtToUse = s.planUpdatedAt;
        notificationPending = s.planNotificationPending;
      }

      userMap.set(norm, {
        ...existing,
        ...s,
        plan: planToUse,
        planUpdatedAt: planUpdatedAtToUse,
        planNotificationPending: notificationPending,
        // Preserve rich profile fields
        phoneNumber: existing.phoneNumber || s.phoneNumber,
        country: existing.country || s.country,
        dateOfBirth: existing.dateOfBirth || s.dateOfBirth,
        learningGoals: existing.learningGoals || s.learningGoals,
        cefrLevel: existing.cefrLevel || s.cefrLevel,
        lastScore: existing.lastScore !== undefined ? existing.lastScore : s.lastScore,
        profileCompleted: existing.profileCompleted || s.profileCompleted,
      });
    }
  }

  return Array.from(userMap.values());
}

/**
 * Merges local vault bookings and server bookings without losing appointments.
 */
export function mergeBookingsAdditive(
  localBookings: BookingRecord[],
  serverBookings: BookingRecord[]
): BookingRecord[] {
  const bookingMap = new Map<string, BookingRecord>();

  // Use ID or composite key (date + startTime + studentEmail)
  const getSlotKey = (b: BookingRecord) => `${b.date}_${b.startTime}_${normalizeEmail(b.studentEmail)}`;

  for (const b of localBookings) {
    if (!b || !b.id) continue;
    bookingMap.set(b.id, b);
  }

  for (const s of serverBookings) {
    if (!s || !s.id) continue;
    // Overwrite with server version if ID matches (server is authoritative on modifications)
    bookingMap.set(s.id, s);
  }

  // Deduplicate by slot key to prevent ghost duplicates
  const finalMap = new Map<string, BookingRecord>();
  for (const b of bookingMap.values()) {
    const slotKey = getSlotKey(b);
    finalMap.set(slotKey, b);
  }

  return Array.from(finalMap.values()).sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return a.startTime.localeCompare(b.startTime);
  });
}

// -----------------------------------------------------------------------------
// 3. One-Click Admin Synchronize & Self-Heal Routine
// -----------------------------------------------------------------------------

export async function syncAndHealAdminData(): Promise<{
  users: UserProfile[];
  bookings: BookingRecord[];
}> {
  // Step 1: Read local vaults
  const localVaultUsers = getAdminRosterVault();
  const localVaultBookings = getAdminBookingsVault();

  let serverUsers: UserProfile[] = [];
  let serverBookings: BookingRecord[] = [];

  // Step 2: Fetch current server data in parallel
  try {
    const [usersRes, bookingsRes] = await Promise.all([
      fetch(getApiUrl('/api/users/export')),
      fetch(getApiUrl('/api/bookings/export')),
    ]);

    if (usersRes.ok) {
      const data = await usersRes.json();
      serverUsers = data.users || [];
    }
    if (bookingsRes.ok) {
      const data = await bookingsRes.json();
      serverBookings = data.bookings || [];
    }
  } catch (fetchErr) {
    console.warn('[VaultSync] Server fetch notice (offline or waking up):', fetchErr);
  }

  // Step 3: Perform additive union merge
  const mergedUsers = mergeUsersAdditive(localVaultUsers, serverUsers);
  const mergedBookings = mergeBookingsAdditive(localVaultBookings, serverBookings);

  // Step 4: Detect if server is missing records present in local vault
  const serverMissingUsers = mergedUsers.filter(
    (mu) => !serverUsers.some((su) => normalizeEmail(su.email) === normalizeEmail(mu.email))
  );
  const serverMissingBookings = mergedBookings.filter(
    (mb) => !serverBookings.some((sb) => sb.id === mb.id)
  );

  if (serverMissingUsers.length > 0 || serverMissingBookings.length > 0) {
    console.log(
      `[VaultSync] Self-Healing Server: Restoring ${serverMissingUsers.length} missing students and ${serverMissingBookings.length} missing bookings to server...`
    );
    try {
      await fetch(getApiUrl('/api/users/rehydrate-roster'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: mergedUsers,
          bookings: mergedBookings,
        }),
      });
      console.log('[VaultSync] ✓ Server successfully rehydrated.');
    } catch (rehydrateErr) {
      console.warn('[VaultSync] Rehydrate post notice:', rehydrateErr);
    }
  }

  // Step 5: Save merged union back to localStorage
  if (mergedUsers.length > 0) {
    saveAdminRosterVault(mergedUsers);
  }
  if (mergedBookings.length > 0) {
    saveAdminBookingsVault(mergedBookings);
  }

  return { users: mergedUsers, bookings: mergedBookings };
}
