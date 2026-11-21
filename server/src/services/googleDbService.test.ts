import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GoogleDbService,
  USER_SHEET_HEADERS,
  BOOKING_SHEET_HEADERS,
} from './googleDbService.js';
import { User } from './userStore.js';
import { Booking } from './bookingStore.js';

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
