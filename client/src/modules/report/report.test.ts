import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateSessionReport,
  calculateClientStats,
  isSessionTooShort,
} from './reportService';
import { SessionReport } from './types';

const MOCK_VALID_REPORT: SessionReport = {
  id: 'rep-12345',
  createdAt: '2026-10-15T10:00:00.000Z',
  scenarioTitle: 'Software Developer Job Interview',
  scenarioCategory: 'Career & Professional',
  level: 'intermediate',
  correctionMode: 'coaching',
  summary:
    'You communicated your technical background clearly and maintained a confident tone throughout the interview. Your sentence structure was varied and you handled complex topics well.',
  strengths: [
    'Articulated trade-offs in software design with clarity',
    'Used active technical verbs naturally',
    'Maintained strong conversational momentum with thoughtful answers',
  ],
  topErrors: [
    {
      original: 'I am working at my company since three years.',
      corrected: 'I have been working at my company for three years.',
      explanation: 'Use present perfect continuous ("have been working") with "for" to express an ongoing duration.',
    },
    {
      original: 'We had to refactored the entire database.',
      corrected: 'We had to refactor the entire database.',
      explanation: 'After modal or semi-modal verbs like "had to", use the base form of the verb ("refactor").',
    },
  ],
  vocabularyUsed: ['Trade-offs', 'Scalability', 'Milestone'],
  nextExercise:
    'Roleplay describing a difficult production bug using the STAR method (Situation, Task, Action, Result).',
  stats: {
    durationSeconds: 120,
    durationFormatted: '2m 0s',
    learnerTurns: 5,
    learnerWords: 150,
    estimatedWpm: 75,
  },
  pronunciationNote: 'Spoken pronunciation is not assessed in this prototype.',
};

describe('Report Module - Too Short Rule', () => {
  it('returns true when learner has 0 turns', () => {
    assert.strictEqual(isSessionTooShort(0, 0), true);
    assert.strictEqual(isSessionTooShort(0, 50), true);
  });

  it('returns true when learner has only 1 turn, even with many words', () => {
    assert.strictEqual(isSessionTooShort(1, 10), true);
    assert.strictEqual(isSessionTooShort(1, 45), true);
  });

  it('returns true when learner has 2+ turns but fewer than 8 words total', () => {
    assert.strictEqual(isSessionTooShort(2, 4), true);
    assert.strictEqual(isSessionTooShort(3, 7), true);
    assert.strictEqual(isSessionTooShort(5, 5), true);
  });

  it('returns false when learner has at least 2 turns and at least 8 words', () => {
    assert.strictEqual(isSessionTooShort(2, 8), false);
    assert.strictEqual(isSessionTooShort(3, 25), false);
    assert.strictEqual(isSessionTooShort(10, 180), false);
  });
});

describe('Report Module - Stats Calculation', () => {
  it('accurately counts learner turns and ignores assistant turns', () => {
    const turns = [
      { role: 'assistant' as const, content: 'Hello! Welcome to our interview. How are you today?' },
      { role: 'user' as const, content: 'Hello Emma! I am doing well, thank you.' },
      { role: 'assistant' as const, content: 'Tell me about your background.' },
      { role: 'user' as const, content: 'I have worked as a developer for five years.' },
    ];

    const stats = calculateClientStats(turns, 60);

    assert.strictEqual(stats.learnerTurns, 2, 'Should count exactly 2 learner turns');
    // "Hello Emma! I am doing well, thank you." -> 8 words
    // "I have worked as a developer for five years." -> 9 words
    // Total = 17 words
    assert.strictEqual(stats.learnerWords, 17, 'Should count exactly 17 words');
  });

  it('handles irregular whitespace and empty messages cleanly', () => {
    const turns = [
      { role: 'user' as const, content: '   Hello    world   with   spaces   ' },
      { role: 'user' as const, content: '' },
      { role: 'user' as const, content: '   ' },
    ];

    const stats = calculateClientStats(turns, 30);
    assert.strictEqual(stats.learnerTurns, 3);
    assert.strictEqual(stats.learnerWords, 4, 'Should count 4 non-empty tokens');
  });

  it('formats duration string correctly across second and minute boundaries', () => {
    const emptyTurns: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    const stats0 = calculateClientStats(emptyTurns, 0);
    assert.strictEqual(stats0.durationFormatted, '0s');

    const stats45 = calculateClientStats(emptyTurns, 45);
    assert.strictEqual(stats45.durationFormatted, '45s');

    const stats60 = calculateClientStats(emptyTurns, 60);
    assert.strictEqual(stats60.durationFormatted, '1m 0s');

    const stats145 = calculateClientStats(emptyTurns, 145);
    assert.strictEqual(stats145.durationFormatted, '2m 25s');
  });

  it('calculates approximate WPM safely without divide-by-zero', () => {
    const turns = [
      { role: 'user' as const, content: 'One two three four five six seven eight nine ten.' },
    ];

    // 0 seconds should use minimum duration bound (0.1 min) and not throw or return NaN
    const stats0 = calculateClientStats(turns, 0);
    assert(!isNaN(stats0.estimatedWpm));
    assert(stats0.estimatedWpm >= 0);

    // 120 words in 60 seconds = 120 WPM
    const longContent = Array(120).fill('word').join(' ');
    const stats60 = calculateClientStats([{ role: 'user', content: longContent }], 60);
    assert.strictEqual(stats60.estimatedWpm, 120);

    // 60 words in 120 seconds = 30 WPM
    const halfContent = Array(60).fill('word').join(' ');
    const stats120 = calculateClientStats([{ role: 'user', content: halfContent }], 120);
    assert.strictEqual(stats120.estimatedWpm, 30);
  });
});

describe('Report Module - JSON Validation', () => {
  it('validates a complete, compliant SessionReport successfully', () => {
    const isValid = validateSessionReport(MOCK_VALID_REPORT);
    assert.strictEqual(isValid, true, 'Valid report must pass schema validation');
  });

  it('rejects null, non-objects, and primitives', () => {
    assert.strictEqual(validateSessionReport(null), false);
    assert.strictEqual(validateSessionReport(undefined), false);
    assert.strictEqual(validateSessionReport('hello'), false);
    assert.strictEqual(validateSessionReport(123), false);
    assert.strictEqual(validateSessionReport([]), false);
  });

  it('rejects reports with missing or empty summary', () => {
    const invalid1 = { ...MOCK_VALID_REPORT, summary: '' };
    const invalid2 = { ...MOCK_VALID_REPORT, summary: undefined };
    assert.strictEqual(validateSessionReport(invalid1), false);
    assert.strictEqual(validateSessionReport(invalid2), false);
  });

  it('rejects reports with non-array strengths or vocabularyUsed', () => {
    const invalid1 = { ...MOCK_VALID_REPORT, strengths: 'Great speaking' };
    const invalid2 = { ...MOCK_VALID_REPORT, vocabularyUsed: null };
    assert.strictEqual(validateSessionReport(invalid1), false);
    assert.strictEqual(validateSessionReport(invalid2), false);
  });

  it('rejects reports with malformed topErrors', () => {
    const invalidTopError1 = {
      ...MOCK_VALID_REPORT,
      topErrors: [{ original: 'Test', corrected: 'Correct' }], // missing explanation
    };
    const invalidTopError2 = {
      ...MOCK_VALID_REPORT,
      topErrors: ['Not an object'],
    };
    assert.strictEqual(validateSessionReport(invalidTopError1), false);
    assert.strictEqual(validateSessionReport(invalidTopError2), false);
  });

  it('rejects reports with missing or invalid stats', () => {
    const invalidStats1 = { ...MOCK_VALID_REPORT, stats: null };
    const invalidStats2 = {
      ...MOCK_VALID_REPORT,
      stats: { durationSeconds: '60' }, // wrong types
    };
    assert.strictEqual(validateSessionReport(invalidStats1), false);
    assert.strictEqual(validateSessionReport(invalidStats2), false);
  });

  it('rejects reports with missing nextExercise', () => {
    const invalid = { ...MOCK_VALID_REPORT, nextExercise: '   ' };
    assert.strictEqual(validateSessionReport(invalid), false);
  });
});
