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

  // Sign out
  useAuthStore.getState().signOut();
  assert.equal(useAuthStore.getState().isAuthenticated, false);
  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().token, null);
});
