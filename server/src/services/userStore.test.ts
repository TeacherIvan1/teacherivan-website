import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { UserStore } from './userStore.js';

test('UserStore - registration, upsert and retrieval', (t) => {
  const tmpPath = path.join(process.cwd(), `test_users_${Date.now()}.json`);
  const store = new UserStore(tmpPath);

  t.after(() => {
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  });

  // 1. Initial state (Admin auto-seeded)
  assert.equal(store.getAllUsers().length, 1);
  const admin = store.getAllUsers()[0];
  assert.equal(admin.role, 'admin');
  assert.equal(admin.profileCompleted, true);

  // Verify Admin credentials
  assert.equal(store.verifyAdminCredentials('ivan@teacherivan.com', 'IvanAdmin2026!'), true);
  assert.equal(store.verifyAdminCredentials('ivan@teacherivan.com', 'wrongpassword'), false);
  assert.equal(store.verifyAdminCredentials('student@example.com', 'IvanAdmin2026!'), false);

  // 2. Upsert new email user
  const user1 = store.upsertUser({
    fullName: 'Maria Rodriguez',
    email: 'maria@example.com',
    dateOfBirth: '1998-05-14',
    country: 'Bolivia',
    authProvider: 'email',
  });

  assert.ok(user1.id.startsWith('usr_'));
  assert.equal(user1.fullName, 'Maria Rodriguez');
  assert.equal(user1.email, 'maria@example.com');
  assert.equal(user1.country, 'Bolivia');
  assert.equal(user1.dateOfBirth, '1998-05-14');
  assert.equal(user1.role, 'student');
  assert.equal(user1.profileCompleted, false);

  // 3. Find by email
  const found = store.findByEmail('MARIA@example.com');
  assert.ok(found);
  assert.equal(found?.id, user1.id);

  // 4. Update Profile & Learning Goals
  const updatedProfile = store.updateUserProfile(
    { email: 'maria@example.com' },
    {
      learningGoals: {
        targetLevel: 'B2',
        primaryGoal: 'Tech & Job Interviews',
        focusSkill: 'Speaking Fluency & Pronunciation',
        personalObjective: 'Ace senior software engineer interview in English',
      },
      cefrLevel: 'B2',
    }
  );
  assert.ok(updatedProfile);
  assert.equal(updatedProfile?.profileCompleted, true);
  assert.equal(updatedProfile?.learningGoals?.primaryGoal, 'Tech & Job Interviews');

  // 5. Upsert existing user (update CEFR level and score)
  const updated = store.upsertUser({
    fullName: 'Maria Rodriguez Updated',
    email: 'maria@example.com',
    cefrLevel: 'B2',
    lastScore: 82,
  });

  assert.equal(updated.id, user1.id);
  assert.equal(updated.fullName, 'Maria Rodriguez Updated');
  assert.equal(updated.cefrLevel, 'B2');
  assert.equal(updated.lastScore, 82);
  assert.equal(updated.country, 'Bolivia'); // Preserved

  // 6. Google user with incomplete profile
  const googleUser = store.upsertUser({
    fullName: 'Carlos Google',
    email: 'carlos@gmail.com',
    authProvider: 'google',
  });
  assert.equal(googleUser.authProvider, 'google');
  assert.equal(googleUser.dateOfBirth, '');
  assert.equal(googleUser.country, '');

  // 7. Complete Google user profile
  const completedGoogleUser = store.upsertUser({
    fullName: 'Carlos Gomez',
    email: 'carlos@gmail.com',
    dateOfBirth: '1995-10-20',
    country: 'Mexico',
  });
  assert.equal(completedGoogleUser.id, googleUser.id);
  assert.equal(completedGoogleUser.country, 'Mexico');
  assert.equal(completedGoogleUser.dateOfBirth, '1995-10-20');

  // 8. Verify session token creation
  const token = store.createSessionToken(user1.id);
  assert.ok(typeof token === 'string' && token.length > 20);

  // 9. Verify total users (Admin + Maria + Carlos = 3)
  assert.equal(store.getAllUsers().length, 3);

  // 10. Default plan for new student is 'free' with 5 sessions/day and 0 classes/week
  assert.equal(user1.plan, 'free');
  assert.equal(user1.maxDailySessions, 5);
  assert.equal(user1.maxWeeklyClasses, 0);

  // 11. Admin updates student plan to 'essential' (1 class/wk, 10 sessions/day)
  const updatedToEssential = store.updateUserPlan(user1.id, 'essential');
  assert.ok(updatedToEssential);
  assert.equal(updatedToEssential?.plan, 'essential');
  assert.equal(updatedToEssential?.maxWeeklyClasses, 1);
  assert.equal(updatedToEssential?.maxDailySessions, 10);

  // 12. Quota check & increment
  const q1 = store.checkAndIncrementDailyQuota(user1.id);
  assert.equal(q1.allowed, true);
  assert.equal(q1.quota.used, 1);
  assert.equal(q1.quota.max, 10);

  // 13. Update to 'pro' (unlimited simulator: max -1, 2 classes/wk)
  const updatedToPro = store.updateUserPlan(user1.id, 'pro');
  assert.equal(updatedToPro?.plan, 'pro');
  assert.equal(updatedToPro?.maxDailySessions, -1);
  assert.equal(updatedToPro?.maxWeeklyClasses, 2);
});
