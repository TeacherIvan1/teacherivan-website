/**
 * ==============================================================================
 * Teacher Ivan Platform - Google Sheets Integration Service
 * File: server/src/services/sheetsService.ts
 * ==============================================================================
 * Connects student registration data with Teacher Ivan's Google Sheet:
 *  - Full Name, Username, Email, Phone Number, Date of Birth, Country,
 *    CEFR Goal, Assigned Plan, Registration Date, Primary Objective.
 *
 * Supported credentials in server/.env:
 *  1. GOOGLE_SHEETS_WEBHOOK_URL: Google Apps Script Web App webhook (Zero-config)
 *  2. GOOGLE_SHEET_ID + GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY: Official Google Sheets API v4
 *  3. In-memory / data/sheets_sync_log.json fallback when credentials are not yet configured.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { User, userStore } from './userStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SheetRowData {
  registrationDate: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  cefrGoal: string;
  assignedPlan: string;
  primaryObjective: string;
}

export interface SheetsSyncLog {
  totalSynced: number;
  lastSyncTime?: string;
  syncedEmails: string[];
  pendingRegistrations: SheetRowData[];
}

export class SheetsService {
  private logFilePath: string;
  private syncLog: SheetsSyncLog = {
    totalSynced: 0,
    syncedEmails: [],
    pendingRegistrations: [],
  };

  constructor(customPath?: string) {
    if (customPath) {
      this.logFilePath = customPath;
    } else {
      const dataDir = path.resolve(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.logFilePath = path.join(dataDir, 'sheets_sync_log.json');
    }
    this.loadLog();
  }

  private loadLog(): void {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const raw = fs.readFileSync(this.logFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed) {
          this.syncLog = {
            totalSynced: parsed.totalSynced || 0,
            lastSyncTime: parsed.lastSyncTime,
            syncedEmails: Array.isArray(parsed.syncedEmails) ? parsed.syncedEmails : [],
            pendingRegistrations: Array.isArray(parsed.pendingRegistrations) ? parsed.pendingRegistrations : [],
          };
        }
      }
    } catch (err) {
      console.warn('[SheetsService] Notice loading sheets_sync_log.json:', err);
    }
  }

  private saveLog(): void {
    try {
      fs.writeFileSync(this.logFilePath, JSON.stringify(this.syncLog, null, 2), 'utf8');
    } catch (err) {
      console.warn('[SheetsService] Notice saving sheets_sync_log.json:', err);
    }
  }

  /**
   * Format User entity into standardized Google Sheets columns:
   * [Date, Full Name, Username, Email, Phone, DOB, Country, CEFR, Plan, Objective]
   */
  public userToRow(user: User): SheetRowData {
    return {
      registrationDate: user.createdAt || new Date().toISOString(),
      fullName: user.fullName || '',
      username: user.username ? `@${user.username}` : '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth || '',
      country: user.country || 'Bolivia',
      cefrGoal: user.cefrLevel || user.learningGoals?.targetLevel || 'A2',
      assignedPlan: (user.plan || 'free').toUpperCase(),
      primaryObjective: user.learningGoals?.primaryGoal || 'Daily Conversational Fluency',
    };
  }

  public rowToValuesArray(row: SheetRowData): string[] {
    return [
      row.registrationDate,
      row.fullName,
      row.username,
      row.email,
      row.phoneNumber,
      row.dateOfBirth,
      row.country,
      row.cefrGoal,
      row.assignedPlan,
      row.primaryObjective,
    ];
  }

  /**
   * Generates a Google Service Account OAuth 2.0 access token via RS256 JWT
   */
  private async getGoogleServiceAccountToken(): Promise<string | null> {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) return null;

    // Handle escaped newlines in .env
    privateKey = privateKey.replace(/\\n/g, '\n');

    try {
      const now = Math.floor(Date.now() / 1000);
      const header = { alg: 'RS256', typ: 'JWT' };
      const claimSet = {
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
      };

      const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
      const b64Claim = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
      const signInput = `${b64Header}.${b64Claim}`;

      const sign = crypto.createSign('RSA-SHA256');
      sign.update(signInput);
      sign.end();
      const signature = sign.sign(privateKey, 'base64url');

      const jwt = `${signInput}.${signature}`;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error('[SheetsService] OAuth Token Error:', errText);
        return null;
      }

      const data = (await tokenRes.json()) as { access_token?: string };
      return data.access_token || null;
    } catch (err) {
      console.error('[SheetsService] Failed to sign Google Service Account JWT:', err);
      return null;
    }
  }

  /**
   * Returns current integration status
   */
  public getStatus(): {
    configured: boolean;
    sheetId?: string;
    mode: 'webhook' | 'service_account' | 'local_buffer';
    totalSynced: number;
    lastSyncTime?: string;
    pendingCount: number;
  } {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    let mode: 'webhook' | 'service_account' | 'local_buffer' = 'local_buffer';
    let configured = false;

    if (webhookUrl && webhookUrl.startsWith('http')) {
      mode = 'webhook';
      configured = true;
    } else if (sheetId && saEmail && process.env.GOOGLE_PRIVATE_KEY) {
      mode = 'service_account';
      configured = true;
    }

    return {
      configured,
      sheetId: sheetId || (webhookUrl ? 'AppsScriptWebhook' : undefined),
      mode,
      totalSynced: this.syncLog.totalSynced,
      lastSyncTime: this.syncLog.lastSyncTime,
      pendingCount: this.syncLog.pendingRegistrations.length,
    };
  }

  /**
   * Appends a newly registered student record to Google Sheets
   */
  public async appendStudentRegistration(user: User): Promise<boolean> {
    const row = this.userToRow(user);
    const status = this.getStatus();

    console.log(`[SheetsService] Processing registration for @${user.username} (${user.email})...`);

    // 1. Google Apps Script Webhook Integration
    if (status.mode === 'webhook') {
      try {
        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL!;
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'append',
            student: row,
            timestamp: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          this.markSynced(row.email);
          console.log(`[SheetsService] ✓ Student @${user.username} appended to Google Sheet via Webhook.`);
          return true;
        }
      } catch (webhookErr) {
        console.warn('[SheetsService] Webhook append notice:', webhookErr);
      }
    }

    // 2. Official Google Sheets API v4 Service Account
    if (status.mode === 'service_account') {
      try {
        const sheetId = process.env.GOOGLE_SHEET_ID!;
        const accessToken = await this.getGoogleServiceAccountToken();

        if (accessToken) {
          const values = [this.rowToValuesArray(row)];
          const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:J:append?valueInputOption=USER_ENTERED`;

          const res = await fetch(appendUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ values }),
          });

          if (res.ok) {
            this.markSynced(row.email);
            console.log(`[SheetsService] ✓ Student @${user.username} appended to Google Sheet via Sheets API v4.`);
            return true;
          } else {
            const errBody = await res.text();
            console.warn('[SheetsService] Sheets API append error:', errBody);
          }
        }
      } catch (apiErr) {
        console.warn('[SheetsService] Sheets API append exception:', apiErr);
      }
    }

    // 3. Fallback: Buffer locally in sheets_sync_log.json
    this.bufferLocally(row);
    console.log(
      `[SheetsService] Buffered registration locally for @${user.username} (Ready to sync when Google credentials are provided).`
    );
    return false;
  }

  /**
   * Batch syncs all users in the roster to Google Sheets
   */
  public async syncAllStudents(users: User[]): Promise<{
    synced: number;
    total: number;
    mode: string;
    error?: string;
  }> {
    const status = this.getStatus();
    const rows = users.map((u) => this.userToRow(u));

    // Webhook batch sync
    if (status.mode === 'webhook') {
      try {
        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL!;
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'batch_sync',
            students: rows,
            timestamp: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          this.syncLog.totalSynced = rows.length;
          this.syncLog.lastSyncTime = new Date().toISOString();
          this.syncLog.syncedEmails = rows.map((r) => r.email);
          this.syncLog.pendingRegistrations = [];
          this.saveLog();
          return { synced: rows.length, total: rows.length, mode: 'webhook' };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { synced: 0, total: rows.length, mode: 'webhook', error: msg };
      }
    }

    // Service Account batch sync
    if (status.mode === 'service_account') {
      try {
        const sheetId = process.env.GOOGLE_SHEET_ID!;
        const accessToken = await this.getGoogleServiceAccountToken();

        if (!accessToken) {
          return { synced: 0, total: rows.length, mode: 'service_account', error: 'Failed to acquire Google access token' };
        }

        const values = [
          [
            'Registration Date',
            'Full Name',
            'Username',
            'Email',
            'Phone Number',
            'Date of Birth',
            'Country',
            'CEFR Goal',
            'Assigned Plan',
            'Primary Objective',
          ],
          ...rows.map((r) => this.rowToValuesArray(r)),
        ];

        // Write or overwrite header and rows starting at A1
        const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:J${values.length}?valueInputOption=USER_ENTERED`;
        const res = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values }),
        });

        if (res.ok) {
          this.syncLog.totalSynced = rows.length;
          this.syncLog.lastSyncTime = new Date().toISOString();
          this.syncLog.syncedEmails = rows.map((r) => r.email);
          this.syncLog.pendingRegistrations = [];
          this.saveLog();
          return { synced: rows.length, total: rows.length, mode: 'service_account' };
        } else {
          const errBody = await res.text();
          return { synced: 0, total: rows.length, mode: 'service_account', error: errBody };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { synced: 0, total: rows.length, mode: 'service_account', error: msg };
      }
    }

    // Local buffer mode (no external credentials yet)
    this.syncLog.totalSynced = rows.length;
    this.syncLog.lastSyncTime = new Date().toISOString();
    this.syncLog.syncedEmails = rows.map((r) => r.email);
    this.syncLog.pendingRegistrations = [];
    this.saveLog();

    return {
      synced: rows.length,
      total: rows.length,
      mode: 'local_buffer',
      error: 'Google Sheets credentials not set in server/.env. Data stored in local buffer.',
    };
  }

  private markSynced(email: string): void {
    if (!this.syncLog.syncedEmails.includes(email)) {
      this.syncLog.syncedEmails.push(email);
    }
    this.syncLog.totalSynced = this.syncLog.syncedEmails.length;
    this.syncLog.lastSyncTime = new Date().toISOString();
    this.syncLog.pendingRegistrations = this.syncLog.pendingRegistrations.filter(
      (r) => r.email !== email
    );
    this.saveLog();
  }

  private bufferLocally(row: SheetRowData): void {
    const existingIdx = this.syncLog.pendingRegistrations.findIndex((r) => r.email === row.email);
    if (existingIdx !== -1) {
      this.syncLog.pendingRegistrations[existingIdx] = row;
    } else {
      this.syncLog.pendingRegistrations.push(row);
    }
    this.saveLog();
  }
}

export const sheetsService = new SheetsService();
