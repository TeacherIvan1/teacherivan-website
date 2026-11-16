import test from 'node:test';
import assert from 'node:assert/strict';
import { VALID_HOURS, getMondayOfWeek, formatIsoDate } from './ClassSchedulerView';

test('ClassSchedulerView - valid 1-hour slots', () => {
  assert.equal(VALID_HOURS.length, 6);
  assert.equal(VALID_HOURS[0].start, '14:00');
  assert.equal(VALID_HOURS[0].end, '15:00');
  assert.equal(VALID_HOURS[1].start, '15:00');
  assert.equal(VALID_HOURS[2].start, '16:00');
  assert.equal(VALID_HOURS[3].start, '17:00');
  assert.equal(VALID_HOURS[4].start, '18:00');
  assert.equal(VALID_HOURS[5].start, '19:00');
  assert.equal(VALID_HOURS[5].end, '20:00');
});

test('ClassSchedulerView - getMondayOfWeek and formatIsoDate', () => {
  const currentMonday = getMondayOfWeek(0);
  assert.ok(currentMonday instanceof Date);

  // Day should be Monday (1 in local or UTC)
  assert.equal(currentMonday.getDay(), 1);

  const nextMonday = getMondayOfWeek(1);
  assert.equal(nextMonday.getDay(), 1);

  // Difference between next Monday and current Monday is exactly 7 days (604800000 ms)
  const diffMs = nextMonday.getTime() - currentMonday.getTime();
  assert.equal(diffMs, 7 * 24 * 3600 * 1000);

  // ISO date format test
  const fixedDate = new Date(2026, 9, 26); // October 26, 2026
  assert.equal(formatIsoDate(fixedDate), '2026-10-26');
});
