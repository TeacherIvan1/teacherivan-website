/**
 * ==============================================================================
 * Teacher Ivan Platform - Cloud Backup Persistence Service
 * File: server/src/services/remoteBackup.ts
 * ==============================================================================
 * Provides automatic, seamless remote JSON backup and restore for users.json
 * and bookings.json across ephemeral Render container restarts using:
 *  1. GitHub Gist API (when GITHUB_BACKUP_GIST_ID + GITHUB_TOKEN are set)
 *  2. Generic Persistent KV / Webhook URL (when PERSISTENT_KV_URL is set)
 *  3. In-memory / client-vault self-healing fallback
 * ==============================================================================
 */

import { userStore, User } from './userStore.js';
import { bookingStore, Booking } from './bookingStore.js';

let isInitialized = false;
let backupTimeout: NodeJS.Timeout | null = null;

const GIST_ID = (process.env.GITHUB_BACKUP_GIST_ID || process.env.BACKUP_GIST_ID || '').trim();
const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
const KV_URL = (process.env.PERSISTENT_KV_URL || '').trim();

/**
 * 1. Initialize Cloud Backup on Server Startup
 * Restores users and bookings if remote storage has newer or existing data.
 */
export async function initRemoteBackup(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  if (GIST_ID && GITHUB_TOKEN) {
    console.log(`[Remote Backup] GitHub Gist cloud persistence detected (Gist ID: ${GIST_ID.slice(0, 6)}...). Restoring...`);
    try {
      const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'TeacherIvan-Server',
        },
      });

      if (!res.ok) {
        console.warn(`[Remote Backup] Warning: Gist fetch returned HTTP ${res.status}`);
        return;
      }

      const gist = await res.json();
      const files = gist.files || {};

      let restoredUsersCount = 0;
      let restoredBookingsCount = 0;

      if (files['users.json'] && files['users.json'].content) {
        try {
          const remoteUsers: User[] = JSON.parse(files['users.json'].content);
          if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
            const merged = userStore.rehydrateRoster(remoteUsers);
            restoredUsersCount = merged.length;
            console.log(`[Remote Backup] Restored ${restoredUsersCount} users from Gist backup.`);
          }
        } catch (e) {
          console.warn('[Remote Backup] Failed parsing users.json from Gist:', e);
        }
      }

      if (files['bookings.json'] && files['bookings.json'].content) {
        try {
          const remoteBookings: Booking[] = JSON.parse(files['bookings.json'].content);
          if (Array.isArray(remoteBookings) && remoteBookings.length > 0) {
            const merged = bookingStore.rehydrateBookings(remoteBookings);
            restoredBookingsCount = merged.length;
            console.log(`[Remote Backup] Restored ${restoredBookingsCount} bookings from Gist backup.`);
          }
        } catch (e) {
          console.warn('[Remote Backup] Failed parsing bookings.json from Gist:', e);
        }
      }
    } catch (err: unknown) {
      console.warn('[Remote Backup] Error connecting to GitHub Gist:', err instanceof Error ? err.message : String(err));
    }
  } else if (KV_URL) {
    console.log('[Remote Backup] Persistent KV URL detected. Restoring remote data...');
    try {
      const res = await fetch(KV_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) userStore.rehydrateRoster(data.users);
        if (Array.isArray(data.bookings)) bookingStore.rehydrateBookings(data.bookings);
        console.log('[Remote Backup] Restored data from Persistent KV.');
      }
    } catch (err) {
      console.warn('[Remote Backup] Error connecting to Persistent KV:', err);
    }
  } else {
    console.log('[Remote Backup] Running with Local Disk + Client Vault Self-Healing (ti_admin_roster_vault & ti_admin_bookings_vault).');
  }
}

/**
 * 2. Schedule Debounced Cloud Backup on State Change
 */
export function triggerRemoteBackup(): void {
  if (!GIST_ID && !KV_URL) return;

  if (backupTimeout) {
    clearTimeout(backupTimeout);
  }

  backupTimeout = setTimeout(async () => {
    await performCloudBackup();
  }, 4000);
}

/**
 * 3. Perform the actual Cloud Backup upload
 */
async function performCloudBackup(): Promise<void> {
  const users = userStore.getAllUsers();
  const bookings = bookingStore.getAllBookings();

  if (GIST_ID && GITHUB_TOKEN) {
    try {
      const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'TeacherIvan-Server',
        },
        body: JSON.stringify({
          description: `Teacher Ivan Database Backup - ${new Date().toISOString()}`,
          files: {
            'users.json': {
              content: JSON.stringify(users, null, 2),
            },
            'bookings.json': {
              content: JSON.stringify(bookings, null, 2),
            },
          },
        }),
      });

      if (res.ok) {
        console.log(`[Remote Backup] Saved ${users.length} users and ${bookings.length} bookings to Gist.`);
      } else {
        console.warn(`[Remote Backup] Failed to update Gist: HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('[Remote Backup] Gist update error:', err);
    }
  } else if (KV_URL) {
    try {
      await fetch(KV_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users, bookings, updatedAt: new Date().toISOString() }),
      });
      console.log('[Remote Backup] Saved data to Persistent KV.');
    } catch (err) {
      console.warn('[Remote Backup] KV update error:', err);
    }
  }
}
