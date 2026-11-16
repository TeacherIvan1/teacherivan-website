import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeUsersAdditive,
  mergeBookingsAdditive,
  BookingRecord,
} from './vaultSync';
import { UserProfile } from './types';

test('vaultSync - mergeUsersAdditive preserves local vault students on server reset', () => {
  // Local vault has 2 registered students + 1 admin
  const localVault: UserProfile[] = [
    {
      id: 'usr_admin',
      fullName: 'Teacher Ivan (Admin)',
      email: 'ivan@teacherivan.com',
      dateOfBirth: '1990-01-01',
      country: 'Bolivia',
      authProvider: 'email',
      role: 'admin',
      plan: 'executive',
      createdAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'usr_carlos_123',
      fullName: 'Carlos Mendoza',
      email: 'carlos@techcorp.com',
      phoneNumber: '+591 71234567',
      dateOfBirth: '1995-04-15',
      country: 'Bolivia',
      authProvider: 'email',
      role: 'student',
      plan: 'pro',
      planUpdatedAt: '2026-10-25T10:00:00.000Z',
      createdAt: '2026-10-20T00:00:00.000Z',
    },
  ];

  // Server restarted fresh with only seed default users (Carlos is missing on server)
  const serverUsers: UserProfile[] = [
    {
      id: 'usr_admin',
      fullName: 'Teacher Ivan (Admin)',
      email: 'ivan@teacherivan.com',
      dateOfBirth: '1990-01-01',
      country: 'Bolivia',
      authProvider: 'email',
      role: 'admin',
      plan: 'executive',
      createdAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'usr_seed_ana',
      fullName: 'Ana Morales',
      email: 'ana@example.com',
      dateOfBirth: '2000-01-01',
      country: 'Bolivia',
      authProvider: 'email',
      role: 'student',
      plan: 'free',
      createdAt: '2026-10-22T00:00:00.000Z',
    },
  ];

  const merged = mergeUsersAdditive(localVault, serverUsers);

  // Carlos must NOT be lost!
  const carlos = merged.find((u) => u.email === 'carlos@techcorp.com');
  assert.ok(carlos, 'Carlos Mendoza must be preserved in additive union merge');
  assert.equal(carlos?.plan, 'pro');
  assert.equal(carlos?.phoneNumber, '+591 71234567');

  // Ana from server must also be included
  const ana = merged.find((u) => u.email === 'ana@example.com');
  assert.ok(ana, 'Ana Morales must be included in additive union merge');

  // Total should be 3 unique users
  assert.equal(merged.length, 3);
});

test('vaultSync - mergeUsersAdditive prefers newer paid plan', () => {
  const local: UserProfile[] = [
    {
      id: 'usr_1',
      fullName: 'Elena',
      email: 'elena@gmail.com',
      dateOfBirth: '1999-01-01',
      country: 'Peru',
      authProvider: 'email',
      plan: 'free',
      planUpdatedAt: '2026-10-20T00:00:00.000Z',
      createdAt: '2026-10-20T00:00:00.000Z',
    },
  ];

  const server: UserProfile[] = [
    {
      id: 'usr_1',
      fullName: 'Elena',
      email: 'elena@gmail.com',
      dateOfBirth: '1999-01-01',
      country: 'Peru',
      authProvider: 'email',
      plan: 'pro',
      planUpdatedAt: '2026-10-26T12:00:00.000Z',
      createdAt: '2026-10-20T00:00:00.000Z',
    },
  ];

  const merged = mergeUsersAdditive(local, server);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].plan, 'pro');
});

test('vaultSync - mergeBookingsAdditive preserves bookings and deduplicates slots', () => {
  const localBookings: BookingRecord[] = [
    {
      id: 'bkg_1',
      studentId: 'usr_carlos_123',
      studentName: 'Carlos Mendoza',
      studentEmail: 'carlos@techcorp.com',
      studentCountry: 'Bolivia',
      date: '2026-11-04',
      dayOfWeek: 'Wednesday',
      startTime: '15:00',
      endTime: '16:00',
      learningGoal: 'Tech Interview',
      createdAt: '2026-10-25T10:00:00.000Z',
    },
  ];

  // Server restarted with 0 bookings
  const serverBookings: BookingRecord[] = [];

  const merged = mergeBookingsAdditive(localBookings, serverBookings);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, 'bkg_1');
  assert.equal(merged[0].studentEmail, 'carlos@techcorp.com');
  assert.equal(merged[0].date, '2026-11-04');
});
