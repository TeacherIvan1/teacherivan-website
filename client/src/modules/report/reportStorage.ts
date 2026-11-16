import { SessionReport } from './types';

const DB_NAME = 'GeminiTutorReportsDB';
const DB_VERSION = 1;
const STORE_NAME = 'reports';

/**
 * Opens or upgrades the IndexedDB database instance.
 * Wrapped in try/catch for safety in private/restricted environments.
 */
function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        } catch (e) {
          console.warn('[IndexedDB onupgradeneeded error]:', e);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('[IndexedDB open error]:', request.error);
        resolve(null);
      };
    } catch (e) {
      console.warn('[IndexedDB openDatabase exception]:', e);
      resolve(null);
    }
  });
}

/**
 * Saves a session report to IndexedDB.
 */
export async function saveReportToIndexedDB(report: SessionReport): Promise<void> {
  try {
    const db = await openDatabase();
    if (!db) {
      // Fallback: save to localStorage if IndexedDB is not available
      saveToLocalStorageFallback(report);
      return;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(report);

        tx.oncomplete = () => {
          db.close();
          resolve();
        };

        tx.onerror = () => {
          console.warn('[IndexedDB put error]:', tx.error);
          saveToLocalStorageFallback(report);
          db.close();
          resolve();
        };
      } catch (txErr) {
        console.warn('[IndexedDB transaction error]:', txErr);
        saveToLocalStorageFallback(report);
        db.close();
        resolve();
      }
    });
  } catch (err) {
    console.warn('[saveReportToIndexedDB top-level error]:', err);
    saveToLocalStorageFallback(report);
  }
}

/**
 * Retrieves all saved reports from IndexedDB, sorted by creation date descending.
 */
export async function getAllReportsFromIndexedDB(): Promise<SessionReport[]> {
  try {
    const db = await openDatabase();
    if (!db) {
      return getFromLocalStorageFallback();
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const reports = (request.result || []) as SessionReport[];
          // Sort newest first
          reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          db.close();
          resolve(reports);
        };

        request.onerror = () => {
          console.warn('[IndexedDB getAll error]:', request.error);
          db.close();
          resolve(getFromLocalStorageFallback());
        };
      } catch (txErr) {
        console.warn('[IndexedDB getAll transaction error]:', txErr);
        db.close();
        resolve(getFromLocalStorageFallback());
      }
    });
  } catch (err) {
    console.warn('[getAllReportsFromIndexedDB error]:', err);
    return getFromLocalStorageFallback();
  }
}

/**
 * Deletes a single session report by ID.
 */
export async function deleteReportFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    if (!db) {
      deleteFromLocalStorageFallback(id);
      return;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);

        tx.oncomplete = () => {
          db.close();
          resolve();
        };

        tx.onerror = () => {
          console.warn('[IndexedDB delete error]:', tx.error);
          deleteFromLocalStorageFallback(id);
          db.close();
          resolve();
        };
      } catch (txErr) {
        console.warn('[IndexedDB delete transaction error]:', txErr);
        deleteFromLocalStorageFallback(id);
        db.close();
        resolve();
      }
    });
  } catch (err) {
    console.warn('[deleteReportFromIndexedDB error]:', err);
    deleteFromLocalStorageFallback(id);
  }
}

/**
 * Clears all saved session reports.
 */
export async function deleteAllReportsFromIndexedDB(): Promise<void> {
  try {
    const db = await openDatabase();
    if (!db) {
      clearLocalStorageFallback();
      return;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();

        tx.oncomplete = () => {
          db.close();
          clearLocalStorageFallback();
          resolve();
        };

        tx.onerror = () => {
          console.warn('[IndexedDB clear error]:', tx.error);
          clearLocalStorageFallback();
          db.close();
          resolve();
        };
      } catch (txErr) {
        console.warn('[IndexedDB clear transaction error]:', txErr);
        clearLocalStorageFallback();
        db.close();
        resolve();
      }
    });
  } catch (err) {
    console.warn('[deleteAllReportsFromIndexedDB error]:', err);
    clearLocalStorageFallback();
  }
}

// --- LocalStorage Fallback Helpers ---

const FALLBACK_KEY = 'gemini_live_session_reports_fallback';

function saveToLocalStorageFallback(report: SessionReport): void {
  try {
    const current = getFromLocalStorageFallback();
    const updated = [report, ...current.filter((r) => r.id !== report.id)];
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch {}
}

function getFromLocalStorageFallback(): SessionReport[] {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function deleteFromLocalStorageFallback(id: string): void {
  try {
    const current = getFromLocalStorageFallback();
    const filtered = current.filter((r) => r.id !== id);
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(filtered));
  } catch {}
}

function clearLocalStorageFallback(): void {
  try {
    localStorage.removeItem(FALLBACK_KEY);
  } catch {}
}
