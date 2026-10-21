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

  // 1. Initial state
  assert.equal(store.getAllUsers().length, 0);

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

  // 3. Find by email
  const found = store.findByEmail('MARIA@example.com');
  assert.ok(found);
  assert.equal(found?.id, user1.id);

  // 4. Upsert existing user (update CEFR level and score)
  const updated = store.upsertUser({
    fullName: 'Maria Rodriguez Updated',
    email: 'maria@example.com',
    cefrLevel: 'B1',
    lastScore: 82,
  });

  assert.equal(updated.id, user1.id);
  assert.equal(updated.fullName, 'Maria Rodriguez Updated');
  assert.equal(updated.cefrLevel, 'B1');
  assert.equal(updated.lastScore, 82);
  assert.equal(updated.country, 'Bolivia'); // Preserved

  // 5. Google user with incomplete profile
  const googleUser = store.upsertUser({
    fullName: 'Carlos Google',
    email: 'carlos@gmail.com',
    authProvider: 'google',
  });
  assert.equal(googleUser.authProvider, 'google');
  assert.equal(googleUser.dateOfBirth, '');
  assert.equal(googleUser.country, '');

  // 6. Complete Google user profile
  const completedGoogleUser = store.upsertUser({
    fullName: 'Carlos Gomez',
    email: 'carlos@gmail.com',
    dateOfBirth: '1995-10-20',
    country: 'Mexico',
  });
  assert.equal(completedGoogleUser.id, googleUser.id);
  assert.equal(completedGoogleUser.country, 'Mexico');
  assert.equal(completedGoogleUser.dateOfBirth, '1995-10-20');

  // 7. Verify session token creation
  const token = store.createSessionToken(user1.id);
  assert.ok(typeof token === 'string' && token.length > 20);

  // 8. Verify total users
  assert.equal(store.getAllUsers().length, 2);
});
