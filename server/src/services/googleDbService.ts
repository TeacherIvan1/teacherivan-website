/**
 * ==============================================================================
 * Teacher Ivan Platform - Authoritative 2-Way Google Database Service
 * File: server/src/services/googleDbService.ts
 * ==============================================================================
 * Connects directly to Teacher Ivan's protected Google Sheet in Google Drive
 * via Google Sheets API v4 using Service Account credentials.
 *
 * Provides real-time 2-way read/write sync:
 *  - Tab 'Users' (20 columns)
 *  - Tab 'Bookings' (12 columns)
 *
 * Ensures data survives ephemeral Render restarts and allows live administrative
 * management directly from Google Sheets or the Admin Dev Mode dashboard.
 * ==============================================================================
 */

import { google, sheets_v4 } from 'googleapis';
import { User, userStore, StudentPlan, LearningGoals } from './userStore.js';
import { Booking, bookingStore, BookingStartTime, BookingEndTime } from './bookingStore.js';

export const USER_SHEET_HEADERS = [
  'ID',
  'Username',
  'Full Name',
  'Email',
  'Phone Number',
  'Date of Birth',
  'Country',
  'Auth Provider',
  'Role',
  'Plan',
  'Plan Updated At',
  'Weekly Classes Quota',
  'Daily AI Sessions Quota',
  'Daily Sessions Used',
  'Last Session Date',
  'Profile Completed',
  'CEFR Level',
  'Primary Goal',
  'Focus Skill',
  'Personal Objective / Notes',
];

export const BOOKING_SHEET_HEADERS = [
  'Booking ID',
  'Date',
  'Day of Week',
  'Start Time',
  'End Time',
  'Student ID',
  'Student Name',
  'Student Email',
  'Student Country',
  'Learning Goal',
  'Status',
  'Created At',
];

export interface GoogleDbStatus {
  configured: boolean;
  sheetId?: string;
  hasServiceAccount: boolean;
  hasPrivateKey: boolean;
  lastSyncTime?: string;
  userCount: number;
  bookingCount: number;
  status: 'connected' | 'not_configured' | 'error';
  errorMessage?: string;
}

export class GoogleDbService {
  private sheetsClient: sheets_v4.Sheets | null = null;
  private spreadsheetId: string | null = null;
  private lastSyncTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 15000; // 15s cache
  private isInitializing: boolean = false;
  private isInitialized: boolean = false;
  private lastError: string | null = null;

  constructor() {
    this.initClient();
  }

  private initClient(): boolean {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!sheetId || !clientEmail || !privateKey) {
      this.sheetsClient = null;
      this.spreadsheetId = null;
      console.warn('[GoogleDB] Running in local-disk fallback until GOOGLE_SHEET_ID / Service Account vars are set');
      return false;
    }

    try {
      privateKey = privateKey.replace(/\\n/g, '\n');
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheetsClient = google.sheets({ version: 'v4', auth });
      this.spreadsheetId = sheetId;
      this.lastError = null;
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[GoogleDbService] Initialization error:', msg);
      this.lastError = msg;
      this.sheetsClient = null;
      return false;
    }
  }

  public isConfigured(): boolean {
    if (!this.sheetsClient || !this.spreadsheetId) {
      return this.initClient();
    }
    return true;
  }

  public getStatus(): GoogleDbStatus {
    const configured = this.isConfigured();
    return {
      configured,
      sheetId: this.spreadsheetId || undefined,
      hasServiceAccount: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
      hasPrivateKey: Boolean(process.env.GOOGLE_PRIVATE_KEY),
      lastSyncTime: this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp).toISOString() : undefined,
      userCount: userStore.getAllUsers().length,
      bookingCount: bookingStore.getAllBookings().length,
      status: configured ? (this.lastError ? 'error' : 'connected') : 'not_configured',
      errorMessage: this.lastError || undefined,
    };
  }

  /**
   * Checks whether the 'Users' and 'Bookings' sheets exist with proper headers.
   * If missing, creates the sheets and seeds the headers.
   */
  public async ensureTabsExist(): Promise<boolean> {
    if (!this.isConfigured() || !this.sheetsClient || !this.spreadsheetId) {
      return false;
    }

    try {
      const meta = await this.sheetsClient.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const existingSheets = meta.data.sheets?.map((s) => s.properties?.title) || [];
      const requests: sheets_v4.Schema$Request[] = [];

      if (!existingSheets.includes('Users')) {
        requests.push({
          addSheet: {
            properties: {
              title: 'Users',
              gridProperties: { rowCount: 1000, columnCount: 20 },
            },
          },
        });
      }

      if (!existingSheets.includes('Bookings')) {
        requests.push({
          addSheet: {
            properties: {
              title: 'Bookings',
              gridProperties: { rowCount: 1000, columnCount: 12 },
            },
          },
        });
      }

      if (requests.length > 0) {
        await this.sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: { requests },
        });
        console.log('[GoogleDbService] Created missing Google Sheets tabs (Users, Bookings).');
      }

      // Check and seed headers if empty
      const userHeaderRes = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A1:T1',
      });

      if (!userHeaderRes.data.values || userHeaderRes.data.values.length === 0 || !userHeaderRes.data.values[0]?.length) {
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Users!A1:T1',
          valueInputOption: 'RAW',
          requestBody: { values: [USER_SHEET_HEADERS] },
        });
      }

      const bookingHeaderRes = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Bookings!A1:L1',
      });

      if (!bookingHeaderRes.data.values || bookingHeaderRes.data.values.length === 0 || !bookingHeaderRes.data.values[0]?.length) {
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Bookings!A1:L1',
          valueInputOption: 'RAW',
          requestBody: { values: [BOOKING_SHEET_HEADERS] },
        });
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[GoogleDbService] Notice ensuring tabs exist:', msg);
      this.lastError = msg;
      return false;
    }
  }

  /**
   * Convert a User entity to a 20-column array
   */
  public userToRow(u: User): (string | number)[] {
    return [
      u.id || '',
      u.username || '',
      u.fullName || '',
      u.email || '',
      u.phoneNumber || '',
      u.dateOfBirth || '',
      u.country || '',
      u.authProvider || 'email',
      u.role || 'student',
      u.plan || 'free',
      u.planUpdatedAt || '',
      u.maxWeeklyClasses !== undefined ? u.maxWeeklyClasses : 0,
      u.maxDailySessions !== undefined ? u.maxDailySessions : 5,
      u.dailySessionsUsed !== undefined ? u.dailySessionsUsed : 0,
      u.lastSessionDate || '',
      u.profileCompleted ? 'TRUE' : 'FALSE',
      u.cefrLevel || u.learningGoals?.targetLevel || 'A2',
      u.learningGoals?.primaryGoal || '',
      u.learningGoals?.focusSkill || '',
      u.learningGoals?.personalObjective || '',
    ];
  }

  /**
   * Parse a row from the 'Users' tab into a partial User entity
   */
  public rowToUser(row: any[]): Partial<User> | null {
    if (!row || row.length < 4) return null;
    const id = row[0] ? String(row[0]).trim() : '';
    const username = row[1] ? String(row[1]).trim().replace(/^@/, '') : '';
    const fullName = row[2] ? String(row[2]).trim() : '';
    const email = row[3] ? String(row[3]).trim().toLowerCase() : '';

    if (!email || !email.includes('@')) return null;

    const phoneNumber = row[4] ? String(row[4]).trim() : undefined;
    const dateOfBirth = row[5] ? String(row[5]).trim() : '';
    const country = row[6] ? String(row[6]).trim() : 'Bolivia';
    const authProvider = (row[7] === 'google' ? 'google' : 'email') as 'email' | 'google';
    const role = (row[8] === 'admin' ? 'admin' : 'student') as 'student' | 'admin';
    const plan = (['free', 'essential', 'pro', 'executive'].includes(String(row[9]).toLowerCase())
      ? String(row[9]).toLowerCase()
      : 'free') as StudentPlan;
    const planUpdatedAt = row[10] ? String(row[10]).trim() : undefined;
    const maxWeeklyClasses = row[11] !== undefined && row[11] !== '' ? parseInt(String(row[11]), 10) : undefined;
    const maxDailySessions = row[12] !== undefined && row[12] !== '' ? parseInt(String(row[12]), 10) : undefined;
    const dailySessionsUsed = row[13] !== undefined && row[13] !== '' ? parseInt(String(row[13]), 10) : 0;
    const lastSessionDate = row[14] ? String(row[14]).trim() : undefined;
    const profileCompleted = String(row[15]).toUpperCase() === 'TRUE';
    const cefrLevel = row[16] ? String(row[16]).trim() : undefined;
    const primaryGoal = row[17] ? String(row[17]).trim() : undefined;
    const focusSkill = row[18] ? String(row[18]).trim() : undefined;
    const personalObjective = row[19] ? String(row[19]).trim() : undefined;

    const learningGoals: LearningGoals | undefined =
      primaryGoal || focusSkill || personalObjective || cefrLevel
        ? {
            targetLevel: cefrLevel || 'B1',
            primaryGoal: primaryGoal || 'Daily Conversational Fluency',
            focusSkill: focusSkill || 'Speaking Fluency & Pronunciation',
            personalObjective: personalObjective || '',
          }
        : undefined;

    return {
      id: id || undefined,
      username: username || undefined,
      fullName: fullName || 'Student',
      email,
      phoneNumber,
      dateOfBirth,
      country,
      authProvider,
      role,
      plan,
      planUpdatedAt,
      maxWeeklyClasses,
      maxDailySessions,
      dailySessionsUsed,
      lastSessionDate,
      profileCompleted,
      cefrLevel,
      learningGoals,
    };
  }

  /**
   * Convert a Booking entity to a 12-column array
   */
  public bookingToRow(b: Booking): (string | number)[] {
    return [
      b.id || '',
      b.date || '',
      b.dayOfWeek || '',
      b.startTime || '',
      b.endTime || '',
      b.studentId || '',
      b.studentName || '',
      b.studentEmail || '',
      b.studentCountry || '',
      b.learningGoal || '',
      'CONFIRMED',
      b.createdAt || '',
    ];
  }

  /**
   * Parse a row from the 'Bookings' tab into a Booking entity
   */
  public rowToBooking(row: any[]): Booking | null {
    if (!row || row.length < 8) return null;
    const id = row[0] ? String(row[0]).trim() : '';
    const date = row[1] ? String(row[1]).trim() : '';
    const dayOfWeek = row[2] as Booking['dayOfWeek'];
    const startTime = row[3] as BookingStartTime;
    const endTime = row[4] as BookingEndTime;
    const studentId = row[5] ? String(row[5]).trim() : '';
    const studentName = row[6] ? String(row[6]).trim() : '';
    const studentEmail = row[7] ? String(row[7]).trim() : '';
    const studentCountry = row[8] ? String(row[8]).trim() : 'Bolivia';
    const learningGoal = row[9] ? String(row[9]).trim() : 'Daily Conversational Fluency';
    const status = row[10] ? String(row[10]).trim().toUpperCase() : 'CONFIRMED';
    const createdAt = row[11] ? String(row[11]).trim() : new Date().toISOString();

    if (!id || !date || !startTime || status === 'CANCELLED') {
      return null;
    }

    return {
      id,
      studentId: studentId || `usr_${studentEmail.replace(/[^a-z0-9]/gi, '_')}`,
      studentName,
      studentEmail,
      studentCountry,
      date,
      dayOfWeek: dayOfWeek || 'Monday',
      startTime,
      endTime: endTime || '15:00',
      learningGoal,
      createdAt,
    };
  }

  /**
   * Two-Way Read Sync: fetches live updates from Google Sheets into server memory and disk
   * Includes 15-second debounce cache unless force === true.
   */
  public async syncFromGoogleDb(force: boolean = false): Promise<{
    synced: boolean;
    userCount: number;
    bookingCount: number;
    lastSyncTime?: string;
  }> {
    const now = Date.now();
    if (!force && this.lastSyncTimestamp && now - this.lastSyncTimestamp < this.CACHE_TTL_MS) {
      return {
        synced: false,
        userCount: userStore.getAllUsers().length,
        bookingCount: bookingStore.getAllBookings().length,
        lastSyncTime: new Date(this.lastSyncTimestamp).toISOString(),
      };
    }

    if (!this.isConfigured() || !this.sheetsClient || !this.spreadsheetId) {
      return {
        synced: false,
        userCount: userStore.getAllUsers().length,
        bookingCount: bookingStore.getAllBookings().length,
      };
    }

    try {
      if (!this.isInitialized) {
        await this.ensureTabsExist();
      }

      // 1. Sync Users Tab
      const usersRes = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A2:T',
      });

      const userRows = usersRes.data.values || [];
      let importedUsers = 0;
      for (const row of userRows) {
        const parsed = this.rowToUser(row);
        if (parsed && parsed.email) {
          userStore.syncClientUser(parsed);
          importedUsers++;
        }
      }

      // 2. Sync Bookings Tab
      const bookingsRes = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Bookings!A2:L',
      });

      const bookingRows = bookingsRes.data.values || [];
      const parsedBookings: Booking[] = [];
      for (const row of bookingRows) {
        const b = this.rowToBooking(row);
        if (b) parsedBookings.push(b);
      }

      if (parsedBookings.length > 0) {
        bookingStore.rehydrateBookings(parsedBookings);
      }

      this.lastSyncTimestamp = Date.now();
      this.lastError = null;

      console.log(
        `[GoogleDbService] ✓ Live 2-way sync complete: ${importedUsers} users, ${parsedBookings.length} active bookings.`
      );

      return {
        synced: true,
        userCount: userStore.getAllUsers().length,
        bookingCount: bookingStore.getAllBookings().length,
        lastSyncTime: new Date(this.lastSyncTimestamp).toISOString(),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[GoogleDbService] syncFromGoogleDb notice:', msg);
      this.lastError = msg;
      return {
        synced: false,
        userCount: userStore.getAllUsers().length,
        bookingCount: bookingStore.getAllBookings().length,
      };
    }
  }

  /**
   * Upsert a student record in Google Sheets 'Users' tab
   */
  public async upsertUserInGoogleDb(user: User): Promise<boolean> {
    if (!this.isConfigured() || !this.sheetsClient || !this.spreadsheetId) {
      return false;
    }

    try {
      if (!this.isInitialized) {
        await this.ensureTabsExist();
      }

      // Fetch existing user rows to check for match by ID or Email
      const res = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:D',
      });

      const rows = res.data.values || [];
      let targetRowIndex = -1;

      for (let i = 1; i < rows.length; i++) {
        const rowId = rows[i]?.[0];
        const rowEmail = rows[i]?.[3];
        if (
          (rowId && user.id && rowId === user.id) ||
          (rowEmail && user.email && rowEmail.toLowerCase() === user.email.toLowerCase())
        ) {
          targetRowIndex = i + 1; // 1-based index in sheet
          break;
        }
      }

      const rowValues = this.userToRow(user);

      if (targetRowIndex > 0) {
        // Update existing row
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Users!A${targetRowIndex}:T${targetRowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [rowValues] },
        });
        console.log(`[GoogleDbService] ✓ Updated user row ${targetRowIndex} for ${user.email} in Google Sheet.`);
      } else {
        // Append new row
        await this.sheetsClient.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'Users!A:T',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: [rowValues] },
        });
        console.log(`[GoogleDbService] ✓ Appended new user ${user.email} to Google Sheet.`);
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[GoogleDbService] upsertUserInGoogleDb notice:', msg);
      this.lastError = msg;
      return false;
    }
  }

  /**
   * Upsert a booking record in Google Sheets 'Bookings' tab
   */
  public async upsertBookingInGoogleDb(booking: Booking): Promise<boolean> {
    if (!this.isConfigured() || !this.sheetsClient || !this.spreadsheetId) {
      return false;
    }

    try {
      if (!this.isInitialized) {
        await this.ensureTabsExist();
      }

      const res = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Bookings!A:A',
      });

      const rows = res.data.values || [];
      let targetRowIndex = -1;

      for (let i = 1; i < rows.length; i++) {
        const rowId = rows[i]?.[0];
        if (rowId && rowId === booking.id) {
          targetRowIndex = i + 1;
          break;
        }
      }

      const rowValues = this.bookingToRow(booking);

      if (targetRowIndex > 0) {
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Bookings!A${targetRowIndex}:L${targetRowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [rowValues] },
        });
        console.log(`[GoogleDbService] ✓ Updated booking row ${targetRowIndex} for ${booking.id} in Google Sheet.`);
      } else {
        await this.sheetsClient.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'Bookings!A:L',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: [rowValues] },
        });
        console.log(`[GoogleDbService] ✓ Appended new booking ${booking.id} to Google Sheet.`);
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[GoogleDbService] upsertBookingInGoogleDb notice:', msg);
      this.lastError = msg;
      return false;
    }
  }

  /**
   * Mark a booking as CANCELLED in Google Sheets 'Bookings' tab
   */
  public async deleteBookingInGoogleDb(id: string): Promise<boolean> {
    if (!this.isConfigured() || !this.sheetsClient || !this.spreadsheetId) {
      return false;
    }

    try {
      if (!this.isInitialized) {
        await this.ensureTabsExist();
      }

      const res = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Bookings!A:A',
      });

      const rows = res.data.values || [];
      let targetRowIndex = -1;

      for (let i = 1; i < rows.length; i++) {
        if (rows[i]?.[0] === id) {
          targetRowIndex = i + 1;
          break;
        }
      }

      if (targetRowIndex > 0) {
        // Mark status as CANCELLED in column K
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Bookings!K${targetRowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['CANCELLED']] },
        });
        console.log(`[GoogleDbService] ✓ Marked booking ${id} as CANCELLED at row ${targetRowIndex} in Google Sheet.`);
        return true;
      }

      return false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[GoogleDbService] deleteBookingInGoogleDb notice:', msg);
      this.lastError = msg;
      return false;
    }
  }
}

export const googleDbService = new GoogleDbService();
