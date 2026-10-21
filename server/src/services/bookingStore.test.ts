import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { BookingStore, VALID_SLOTS } from './bookingStore.js';
import { getDeterministicSprint } from './curriculumGenerator.js';

test('BookingStore - slot validation, booking creation, double booking prevention, and limits', (t) => {
  const tmpPath = path.join(process.cwd(), `test_bookings_${Date.now()}.json`);
  const store = new BookingStore(tmpPath);

  t.after(() => {
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  });

  // 1. Initial State
  assert.equal(store.getAllBookings().length, 0);

  // 2. Validate valid 1-hour slots count
  assert.equal(VALID_SLOTS.length, 6);
  assert.equal(VALID_SLOTS[0].start, '14:00');
  assert.equal(VALID_SLOTS[5].end, '20:00');

  // 3. Day of week detection
  assert.equal(store.getDayOfWeek('2026-10-26'), 'Monday');
  assert.equal(store.getDayOfWeek('2026-10-27'), 'Tuesday');
  assert.equal(store.getDayOfWeek('2026-10-28'), 'Wednesday');
  assert.equal(store.getDayOfWeek('2026-10-29'), 'Thursday');
  assert.equal(store.getDayOfWeek('2026-10-30'), 'Friday');
  assert.equal(store.getDayOfWeek('2026-10-31'), null); // Saturday invalid
  assert.equal(store.getDayOfWeek('2026-11-01'), null); // Sunday invalid

  // 4. Reject booking on weekend
  assert.throws(
    () => {
      store.createBooking({
        studentId: 'usr_1',
        studentName: 'Ana Gomez',
        studentEmail: 'ana@example.com',
        studentCountry: 'Bolivia',
        date: '2026-10-31', // Saturday
        startTime: '15:00',
      });
    },
    /Monday through Friday/
  );

  // 5. Successful booking on Monday
  const booking1 = store.createBooking({
    studentId: 'usr_1',
    studentName: 'Ana Gomez',
    studentEmail: 'ana@example.com',
    studentCountry: 'Bolivia',
    date: '2026-10-26', // Monday
    startTime: '15:00',
    learningGoal: 'Tech & Job Interviews',
  });

  assert.ok(booking1.id.startsWith('bkg_'));
  assert.equal(booking1.dayOfWeek, 'Monday');
  assert.equal(booking1.startTime, '15:00');
  assert.equal(booking1.endTime, '16:00');
  assert.equal(store.getAllBookings().length, 1);

  // 6. Prevent another student from double booking the exact same slot
  assert.throws(
    () => {
      store.createBooking({
        studentId: 'usr_2',
        studentName: 'Carlos Silva',
        studentEmail: 'carlos@example.com',
        studentCountry: 'Peru',
        date: '2026-10-26',
        startTime: '15:00',
      });
    },
    /already booked/
  );

  // 7. Prevent the same student from booking a second class in the same week
  assert.throws(
    () => {
      store.createBooking({
        studentId: 'usr_1',
        studentName: 'Ana Gomez',
        studentEmail: 'ana@example.com',
        studentCountry: 'Bolivia',
        date: '2026-10-28', // Wednesday in same week
        startTime: '16:00',
      });
    },
    /already have a class scheduled/
  );

  // 8. Reschedule / Delete booking
  const deleted = store.deleteBooking(booking1.id, 'usr_1');
  assert.equal(deleted, true);
  assert.equal(store.getAllBookings().length, 0);

  // 9. After deleting, student can book a new slot in that week
  const rescheduled = store.createBooking({
    studentId: 'usr_1',
    studentName: 'Ana Gomez',
    studentEmail: 'ana@example.com',
    studentCountry: 'Bolivia',
    date: '2026-10-28',
    startTime: '17:00',
  });
  assert.equal(rescheduled.startTime, '17:00');
  assert.equal(store.getAllBookings().length, 1);
});

test('CurriculumGenerator - deterministic goal-based sprint returns 5 structured days matching objectives', () => {
  const sprint = getDeterministicSprint({
    targetLevel: 'B2',
    primaryGoal: 'Tech & Job Interviews',
    focusSkill: 'Speaking Fluency & Pronunciation',
    personalObjective: 'Prepare for Google engineering interview',
  });

  assert.equal(sprint.days.length, 5);
  assert.equal(sprint.days[0].day, 'D1');
  assert.equal(sprint.days[0].type, 'Receptive Input');
  assert.equal(sprint.days[1].day, 'D2');
  assert.equal(sprint.days[1].type, 'Structural Processing');
  assert.equal(sprint.days[2].day, 'D3');
  assert.equal(sprint.days[2].type, 'Async Oral Production');
  assert.equal(sprint.days[3].day, 'D4');
  assert.equal(sprint.days[3].type, 'Functional Writing Prompt');
  assert.ok(sprint.days[3].functionalWritingPrompt?.includes('Google engineering interview'));
  assert.equal(sprint.days[4].day, 'D5');
  assert.equal(sprint.days[4].type, 'Weekly Closure');
});
