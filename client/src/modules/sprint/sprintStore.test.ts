import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TEACHER_PHONE, TEACHER_PHONE_CLEAN, WHATSAPP_BASE_URL, getWhatsAppUrl } from '../../config/contact';
import { useSprintStore } from './sprintStore';

describe('Contact Configuration & WhatsApp Links', () => {
  it('defines the official Teacher Ivan contact constants correctly', () => {
    assert.strictEqual(TEACHER_PHONE, '+591 72878330');
    assert.strictEqual(TEACHER_PHONE_CLEAN, '59172878330');
    assert.strictEqual(WHATSAPP_BASE_URL, 'https://wa.me/59172878330');
  });

  it('generates well-formed WhatsApp click-to-chat URLs with encoded messages', () => {
    const defaultUrl = getWhatsAppUrl();
    assert.strictEqual(defaultUrl, 'https://wa.me/59172878330');

    const msg = 'Hola Teacher Ivan! Me gustaría consultar por clases.';
    const customUrl = getWhatsAppUrl(msg);
    assert.strictEqual(
      customUrl,
      `https://wa.me/59172878330?text=${encodeURIComponent(msg)}`
    );
  });
});

describe('Sprint Store - Habit Tracking & Report Metrics', () => {
  beforeEach(() => {
    useSprintStore.getState().resetSprintWeek();
  });

  it('initializes with default profile and zero completed stages', () => {
    const state = useSprintStore.getState();
    assert.strictEqual(state.completedStages.length, 0);
    assert.strictEqual(state.profile.cefrLevel, 'B1');
  });

  it('completes stages and marks readings/videos properly', () => {
    const store = useSprintStore.getState();
    store.markReadingComplete('reading-1');
    assert.ok(useSprintStore.getState().completedStages.includes(0));
    assert.ok(useSprintStore.getState().completedReadings.includes('reading-1'));

    store.recordGameResult('recast-challenge', 90, 50, 75);
    assert.ok(useSprintStore.getState().completedStages.includes(1));

    store.saveDay4Writing('This is a test writing sample of appropriate length.', 'Great job!');
    assert.ok(useSprintStore.getState().completedStages.includes(3));
    assert.strictEqual(useSprintStore.getState().day4Writing, 'This is a test writing sample of appropriate length.');
    assert.strictEqual(useSprintStore.getState().day4Feedback, 'Great job!');
  });

  it('opens and closes the weekly report modal', () => {
    useSprintStore.getState().openReportModal();
    assert.strictEqual(useSprintStore.getState().isReportModalOpen, true);

    useSprintStore.getState().closeReportModal();
    assert.strictEqual(useSprintStore.getState().isReportModalOpen, false);
  });
});
