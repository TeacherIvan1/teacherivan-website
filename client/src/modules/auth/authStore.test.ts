import test from 'node:test';
import assert from 'node:assert/strict';
import { useAuthStore } from './authStore';
import { SUPPORTED_COUNTRIES } from './types';

test('authStore - initial state and modal toggles', () => {
  const store = useAuthStore.getState();

  // Initially modal should be closed
  assert.equal(store.isAuthModalOpen, false);

  // Open modal for signup
  store.openAuthModal('signup');
  assert.equal(useAuthStore.getState().isAuthModalOpen, true);
  assert.equal(useAuthStore.getState().authModalMode, 'signup');

  // Open modal for completing profile
  store.openAuthModal('complete_google_profile', { email: 'google@test.com', fullName: 'Google User' });
  assert.equal(useAuthStore.getState().isAuthModalOpen, true);
  assert.equal(useAuthStore.getState().authModalMode, 'complete_google_profile');
  assert.equal(useAuthStore.getState().pendingGoogleProfile?.email, 'google@test.com');

  // Close modal
  store.closeAuthModal();
  assert.equal(useAuthStore.getState().isAuthModalOpen, false);
  assert.equal(useAuthStore.getState().pendingGoogleProfile, null);
});

test('authStore - supported countries list', () => {
  assert.ok(SUPPORTED_COUNTRIES.includes('Bolivia'));
  assert.ok(SUPPORTED_COUNTRIES.includes('Mexico'));
  assert.ok(SUPPORTED_COUNTRIES.includes('Colombia'));
  assert.ok(SUPPORTED_COUNTRIES.includes('Peru'));
  assert.ok(SUPPORTED_COUNTRIES.includes('Argentina'));
  assert.ok(SUPPORTED_COUNTRIES.includes('Chile'));
  assert.ok(SUPPORTED_COUNTRIES.includes('Spain'));
  assert.ok(SUPPORTED_COUNTRIES.includes('USA'));
  assert.ok(SUPPORTED_COUNTRIES.includes('Other'));
});

test('authStore - user stats update and signOut', () => {
  const store = useAuthStore.getState();

  // Mock an authenticated user
  useAuthStore.setState({
    user: {
      id: 'test_123',
      fullName: 'Ana Morales',
      email: 'ana@example.com',
      dateOfBirth: '2000-01-01',
      country: 'Bolivia',
      authProvider: 'email',
      createdAt: new Date().toISOString(),
    },
    token: 'tok_abc',
    isAuthenticated: true,
  });

  assert.equal(useAuthStore.getState().isAuthenticated, true);
  assert.equal(useAuthStore.getState().user?.fullName, 'Ana Morales');

  // Update CEFR score
  useAuthStore.getState().updateUserStats('B2', 88);
  assert.equal(useAuthStore.getState().user?.cefrLevel, 'B2');
  assert.equal(useAuthStore.getState().user?.lastScore, 88);

  // Sign out resets dev mode
  useAuthStore.getState().signOut();
  assert.equal(useAuthStore.getState().isAuthenticated, false);
  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().token, null);
});

test('authStore - student vs admin roles and learning goals schema', () => {
  // 1. Regular Student with incomplete profile
  useAuthStore.setState({
    user: {
      id: 'usr_student_1',
      fullName: 'Carlos Gomez',
      email: 'carlos@example.com',
      dateOfBirth: '1997-03-22',
      country: 'Mexico',
      authProvider: 'email',
      role: 'student',
      profileCompleted: false,
      createdAt: new Date().toISOString(),
    },
    token: 'tok_student',
    isAuthenticated: true,
  });

  const student = useAuthStore.getState().user;
  assert.equal(student?.role, 'student');
  assert.equal(student?.profileCompleted, false);

  // 2. Admin User
  useAuthStore.setState({
    user: {
      id: 'usr_admin_ivan',
      fullName: 'Teacher Ivan (Admin)',
      email: 'ivan@teacherivan.com',
      dateOfBirth: '1990-01-01',
      country: 'Bolivia',
      authProvider: 'email',
      role: 'admin',
      profileCompleted: true,
      learningGoals: {
        targetLevel: 'C1 / IELTS',
        primaryGoal: 'Business & Executive English',
        focusSkill: 'Speaking Fluency & Pronunciation',
        personalObjective: 'Master executive presentation',
      },
      createdAt: new Date().toISOString(),
    },
    token: 'tok_admin',
    isAuthenticated: true,
  });

  const admin = useAuthStore.getState().user;
  assert.equal(admin?.role, 'admin');
  assert.equal(admin?.profileCompleted, true);
  assert.equal(admin?.learningGoals?.targetLevel, 'C1 / IELTS');
  assert.equal(admin?.learningGoals?.primaryGoal, 'Business & Executive English');

  useAuthStore.getState().signOut();
});

test('authStore - banner support on openAuthModal', () => {
  const store = useAuthStore.getState();
  const bannerMessage = 'Sign up free in 30 seconds to unlock all custom scenarios!';

  store.openAuthModal('signup', undefined, bannerMessage);
  assert.equal(useAuthStore.getState().isAuthModalOpen, true);
  assert.equal(useAuthStore.getState().authModalBanner, bannerMessage);

  store.closeAuthModal();
  assert.equal(useAuthStore.getState().isAuthModalOpen, false);
});

test('authStore - plan approval modal state and acknowledgment', async () => {
  useAuthStore.setState({
    user: {
      id: 'usr_student_test',
      fullName: 'Laura Ledezma',
      email: 'laura.test@example.com',
      dateOfBirth: '1995-04-10',
      country: 'Bolivia',
      authProvider: 'email',
      role: 'student',
      plan: 'pro',
      planUpdatedAt: '2026-10-22T20:00:00.000Z',
      planNotificationPending: true,
      createdAt: new Date().toISOString(),
    },
    token: 'tok_test',
    isAuthenticated: true,
    pendingPlanModal: {
      plan: 'pro',
      planUpdatedAt: '2026-10-22T20:00:00.000Z',
    },
  });

  assert.equal(useAuthStore.getState().pendingPlanModal?.plan, 'pro');

  // Acknowledge notification
  await useAuthStore.getState().ackPlanNotification();

  assert.equal(useAuthStore.getState().pendingPlanModal, null);
  assert.equal(useAuthStore.getState().user?.planNotificationPending, false);

  useAuthStore.getState().signOut();
});
