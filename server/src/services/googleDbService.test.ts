import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GoogleDbService,
  USER_SHEET_HEADERS,
  BOOKING_SHEET_HEADERS,
  isGoogleSheetsSyncDisabled,
  isSyntheticTestUser,
  sanitizeSheetPhone,
} from './googleDbService.js';
import { User } from './userStore.js';
import { Booking } from './bookingStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('GoogleDbService - headers and schema validation', () => {
  assert.equal(USER_SHEET_HEADERS.length, 20);
  assert.equal(USER_SHEET_HEADERS[0], 'ID');
  assert.equal(USER_SHEET_HEADERS[3], 'Email');
  assert.equal(USER_SHEET_HEADERS[9], 'Plan');
  assert.equal(USER_SHEET_HEADERS[19], 'Personal Objective / Notes');

  assert.equal(BOOKING_SHEET_HEADERS.length, 12);
  assert.equal(BOOKING_SHEET_HEADERS[0], 'Booking ID');
  assert.equal(BOOKING_SHEET_HEADERS[1], 'Date');
  assert.equal(BOOKING_SHEET_HEADERS[10], 'Status');
});

test('GoogleDbService - User row serialization and deserialization', () => {
  const service = new GoogleDbService();

  const mockUser: User = {
    id: 'usr_test_123',
    username: 'teststudent',
    fullName: 'Test Student',
    email: 'test@example.com',
    phoneNumber: '+591 70000000',
    dateOfBirth: '2000-01-01',
    country: 'Bolivia',
    authProvider: 'google',
    role: 'student',
    plan: 'pro',
    planUpdatedAt: '2026-11-20T00:00:00.000Z',
    maxWeeklyClasses: 3,
    maxDailySessions: -1,
    dailySessionsUsed: 1,
    lastSessionDate: '2026-11-20',
    profileCompleted: true,
    cefrLevel: 'B2',
    learningGoals: {
      targetLevel: 'B2',
      primaryGoal: 'Tech & Job Interviews',
      focusSkill: 'Speaking Fluency & Pronunciation',
      personalObjective: 'Pass Google coding interview in English',
    },
    createdAt: '2026-11-20T00:00:00.000Z',
  };

  const row = service.userToRow(mockUser);
  assert.equal(row.length, 20);
  assert.equal(row[0], 'usr_test_123');
  assert.equal(row[1], 'teststudent');
  assert.equal(row[2], 'Test Student');
  assert.equal(row[3], 'test@example.com');
  assert.equal(row[7], 'google');
  assert.equal(row[9], 'pro');
  assert.equal(row[11], 3);
  assert.equal(row[15], 'TRUE');
  assert.equal(row[16], 'B2');
  assert.equal(row[17], 'Tech & Job Interviews');

  const parsed = service.rowToUser(row);
  assert.ok(parsed);
  assert.equal(parsed.email, 'test@example.com');
  assert.equal(parsed.username, 'teststudent');
  assert.equal(parsed.plan, 'pro');
  assert.equal(parsed.profileCompleted, true);
  assert.equal(parsed.learningGoals?.targetLevel, 'B2');
  assert.equal(parsed.learningGoals?.personalObjective, 'Pass Google coding interview in English');
});

test('GoogleDbService - Booking row serialization and deserialization', () => {
  const service = new GoogleDbService();

  const mockBooking: Booking = {
    id: 'bkg_2026_test',
    studentId: 'usr_test_123',
    studentName: 'Test Student',
    studentEmail: 'test@example.com',
    studentCountry: 'Bolivia',
    date: '2026-11-23',
    dayOfWeek: 'Monday',
    startTime: '16:00',
    endTime: '17:00',
    learningGoal: 'Tech & Job Interviews',
    createdAt: '2026-11-20T10:00:00.000Z',
  };

  const row = service.bookingToRow(mockBooking);
  assert.equal(row.length, 12);
  assert.equal(row[0], 'bkg_2026_test');
  assert.equal(row[1], '2026-11-23');
  assert.equal(row[2], 'Monday');
  assert.equal(row[3], '16:00');
  assert.equal(row[4], '17:00');
  assert.equal(row[10], 'CONFIRMED');

  const parsed = service.rowToBooking(row);
  assert.ok(parsed);
  assert.equal(parsed.id, 'bkg_2026_test');
  assert.equal(parsed.date, '2026-11-23');
  assert.equal(parsed.startTime, '16:00');
  assert.equal(parsed.endTime, '17:00');
  assert.equal(parsed.studentEmail, 'test@example.com');

  // Cancelled booking should be skipped
  const cancelledRow = [...row];
  cancelledRow[10] = 'CANCELLED';
  const cancelledParsed = service.rowToBooking(cancelledRow);
  assert.equal(cancelledParsed, null);
});

test('GoogleDbService - Status and unconfigured safety', () => {
  const service = new GoogleDbService();
  const status = service.getStatus();
  assert.ok(typeof status.configured === 'boolean');
  assert.ok(typeof status.userCount === 'number');
  assert.ok(typeof status.bookingCount === 'number');
  if (!status.configured) {
    assert.equal(status.status, 'not_configured');
  }
});

test('GoogleDbService - Test environment makes 0 Google Sheets API calls even with credentials set', async () => {
  const prevSheetId = process.env.GOOGLE_SHEET_ID;
  const prevEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const prevKey = process.env.GOOGLE_PRIVATE_KEY;
  const prevDisable = process.env.DISABLE_GOOGLE_SHEETS_SYNC;

  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });

  try {
    process.env.GOOGLE_SHEET_ID = '1-fake-sheet-id-for-unit-test';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.iam.gserviceaccount.com';
    process.env.GOOGLE_PRIVATE_KEY = privateKey;
    process.env.DISABLE_GOOGLE_SHEETS_SYNC = 'true';

    assert.equal(isGoogleSheetsSyncDisabled(), true);

    const service = new GoogleDbService();
    assert.equal(service.isConfigured(), false);

    const syncRes = await service.syncFromGoogleDb(true);
    assert.equal(syncRes.synced, false);

    const upsertRes = await service.upsertUserInGoogleDb({
      id: 'usr_real_001',
      username: 'laura',
      fullName: 'Laura Raquel',
      email: 'laura.raquel@gmail.com',
      phoneNumber: '+591 72878330',
      dateOfBirth: '1997-01-10',
      country: 'Bolivia',
      authProvider: 'email',
      createdAt: new Date().toISOString(),
    });
    assert.equal(upsertRes, false);
  } finally {
    if (prevSheetId === undefined) delete process.env.GOOGLE_SHEET_ID;
    else process.env.GOOGLE_SHEET_ID = prevSheetId;
    if (prevEmail === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    else process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = prevEmail;
    if (prevKey === undefined) delete process.env.GOOGLE_PRIVATE_KEY;
    else process.env.GOOGLE_PRIVATE_KEY = prevKey;
    if (prevDisable === undefined) delete process.env.DISABLE_GOOGLE_SHEETS_SYNC;
    else process.env.DISABLE_GOOGLE_SHEETS_SYNC = prevDisable;
  }
});

test('GoogleDbService - Synthetic test user guard & RAW valueInputOption enforcement', () => {
  // Synthetic / E2E accounts must NEVER sync to production Google Sheets
  assert.equal(isSyntheticTestUser({ email: 'valeria_48291_1440_light@example.com', fullName: 'Valeria Mendoza' }), true);
  assert.equal(isSyntheticTestUser({ username: 'student_99123', email: 'foo@gmail.com' }), true);
  assert.equal(isSyntheticTestUser({ email: 'test@example.com' }), true);
  assert.equal(isSyntheticTestUser({ fullName: 'Valeria Mendoza', email: 'custom@gmail.com' }), true);

  // Legitimate real users must pass cleanly
  assert.equal(isSyntheticTestUser({ email: 'laura.raquel@gmail.com', username: 'lauraraquel', fullName: 'Laura Raquel' }), false);
  assert.equal(isSyntheticTestUser({ email: 'ivan@teacherivan.com', username: 'ivan', fullName: 'Teacher Ivan (Admin)' }), false);

  // Phone sanitization handles +591 cleanly and ignores Google Sheets #ERROR! artifacts
  assert.equal(sanitizeSheetPhone('+591 72878330'), '+591 72878330');
  assert.equal(sanitizeSheetPhone('#ERROR!'), '');
  assert.equal(sanitizeSheetPhone('#NAME?'), '');

  // Source-level guarantee: 0 USER_ENTERED calls remain (prevents +591 formula #ERROR!)
  const source = fs.readFileSync(path.resolve(__dirname, 'googleDbService.ts'), 'utf8');
  assert.equal(source.includes("valueInputOption: 'USER_ENTERED'"), false);
  assert.equal(source.includes('valueInputOption: "USER_ENTERED"'), false);
  assert.ok(source.includes("valueInputOption: 'RAW'"));
});
