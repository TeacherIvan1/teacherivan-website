import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { useDevModeStore } from './devModeStore';
import { useReportStore } from '../report/reportStore';
import { translations } from '../i18n/translations';
import { SessionReport } from '../report/types';

describe('Developer Mode & Student View State', () => {
  beforeEach(() => {
    useDevModeStore.getState().setDeveloperMode(false);
  });

  it('defaults to Student View (isDeveloperMode === false)', () => {
    assert.strictEqual(useDevModeStore.getState().isDeveloperMode, false);
  });

  it('updates isDeveloperMode via setDeveloperMode', () => {
    useDevModeStore.getState().setDeveloperMode(true);
    assert.strictEqual(useDevModeStore.getState().isDeveloperMode, true);

    useDevModeStore.getState().setDeveloperMode(false);
    assert.strictEqual(useDevModeStore.getState().isDeveloperMode, false);
  });

  it('toggles developer mode on and off cleanly', () => {
    assert.strictEqual(useDevModeStore.getState().isDeveloperMode, false);
    useDevModeStore.getState().toggleDeveloperMode();
    assert.strictEqual(useDevModeStore.getState().isDeveloperMode, true);
    useDevModeStore.getState().toggleDeveloperMode();
    assert.strictEqual(useDevModeStore.getState().isDeveloperMode, false);
  });
});

describe('Student Report Modal State in reportStore', () => {
  beforeEach(() => {
    useReportStore.getState().dismissReport();
  });

  it('initializes with modal closed (isModalOpen === false)', () => {
    assert.strictEqual(useReportStore.getState().isModalOpen, false);
  });

  it('setModalOpen updates isModalOpen state', () => {
    useReportStore.getState().setModalOpen(true);
    assert.strictEqual(useReportStore.getState().isModalOpen, true);
    useReportStore.getState().setModalOpen(false);
    assert.strictEqual(useReportStore.getState().isModalOpen, false);
  });

  it('viewReport opens the modal and populates currentReport', () => {
    const dummyReport: SessionReport = {
      id: 'rep-test-123',
      createdAt: new Date().toISOString(),
      scenarioTitle: 'Test Scenario',
      scenarioCategory: 'Test',
      level: 'B1 Intermediate',
      correctionMode: 'Coaching',
      summary: 'Great performance and clear pronunciation.',
      strengths: ['Fluency', 'Good vocabulary'],
      topErrors: [
        {
          original: 'I go yesterday',
          corrected: 'I went yesterday',
          explanation: 'Use simple past for finished past events.',
        },
      ],
      vocabularyUsed: ['boarding pass', 'terminal'],
      nextExercise: 'Practice 3 sentences using simple past.',
      stats: {
        durationSeconds: 120,
        durationFormatted: '02:00',
        learnerTurns: 4,
        learnerWords: 35,
        estimatedWpm: 80,
      },
      pronunciationNote: 'Good clear vowel sounds.',
    };

    useReportStore.getState().viewReport(dummyReport);
    const state = useReportStore.getState();
    assert.strictEqual(state.isModalOpen, true);
    assert.strictEqual(state.currentReport?.id, 'rep-test-123');
    assert.strictEqual(state.currentReport?.topErrors.length, 1);
  });

  it('dismissReport resets isModalOpen to false and clears active report', () => {
    useReportStore.getState().setModalOpen(true);
    useReportStore.getState().dismissReport();
    const state = useReportStore.getState();
    assert.strictEqual(state.isModalOpen, false);
    assert.strictEqual(state.currentReport, null);
    assert.strictEqual(state.error, null);
    assert.strictEqual(state.tooShortNotice, null);
  });
});

describe('Translations Completeness for Dev Mode & Student Modal', () => {
  it('contains parallel devMode translations in en and es', () => {
    assert.ok(translations.en.devMode.toggleDev.length > 0);
    assert.ok(translations.es.devMode.toggleDev.length > 0);
    assert.ok(translations.en.devMode.toggleStudent.length > 0);
    assert.ok(translations.es.devMode.toggleStudent.length > 0);
    assert.ok(translations.en.devMode.activeBadge.length > 0);
    assert.ok(translations.es.devMode.activeBadge.length > 0);
    assert.ok(translations.en.devMode.notice.length > 0);
    assert.ok(translations.es.devMode.notice.length > 0);
  });

  it('contains parallel studentModal translations in en and es', () => {
    assert.ok(translations.en.studentModal.title.length > 0);
    assert.ok(translations.es.studentModal.title.length > 0);
    assert.ok(translations.en.studentModal.celebration.length > 0);
    assert.ok(translations.es.studentModal.celebration.length > 0);
    assert.ok(translations.en.studentModal.recastsTitle.length > 0);
    assert.ok(translations.es.studentModal.recastsTitle.length > 0);
    assert.ok(translations.en.studentModal.whatYouSaid.length > 0);
    assert.ok(translations.es.studentModal.whatYouSaid.length > 0);
    assert.ok(translations.en.studentModal.naturalEnglish.length > 0);
    assert.ok(translations.es.studentModal.naturalEnglish.length > 0);
    assert.ok(translations.en.studentModal.practiceAgainBtn.length > 0);
    assert.ok(translations.es.studentModal.practiceAgainBtn.length > 0);
    assert.ok(translations.en.studentModal.closeBtn.length > 0);
    assert.ok(translations.es.studentModal.closeBtn.length > 0);
    assert.ok(translations.en.studentModal.nextStepTitle.length > 0);
    assert.ok(translations.es.studentModal.nextStepTitle.length > 0);
  });

  it('contains student-friendly hero and console strings', () => {
    assert.ok(translations.en.hero.metricAudioStudent.length > 0);
    assert.ok(translations.es.hero.metricAudioStudent.length > 0);
    assert.ok(translations.en.tutorConsole.sessionTaglineStudent.length > 0);
    assert.ok(translations.es.tutorConsole.sessionTaglineStudent.length > 0);
    assert.ok(translations.en.tutorConsole.readyStudent.length > 0);
    assert.ok(translations.es.tutorConsole.readyStudent.length > 0);
    assert.ok(translations.en.tutorConsole.streamingNoticeStudent.length > 0);
    assert.ok(translations.es.tutorConsole.streamingNoticeStudent.length > 0);
  });
});
