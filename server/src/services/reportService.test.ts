import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateLocalCEFRScores,
  matchRecommendedPlan,
  calculateSessionStats,
  isSessionTooShort,
  TurnData,
} from './reportService.js';

describe('ReportService - CEFR Scoring and Competencies', () => {
  it('calculates CEFR score and 4 competency sub-scores within 0-100 bounds', () => {
    const stats = {
      durationSeconds: 120,
      durationFormatted: '2m 0s',
      learnerTurns: 4,
      learnerWords: 140,
      estimatedWpm: 70,
    };

    const result = calculateLocalCEFRScores(stats, 1, 2);

    assert.ok(result.overallScore >= 0 && result.overallScore <= 100);
    assert.ok(['A1', 'A2', 'B1', 'B2', 'C1'].includes(result.cefrLevel));
    assert.ok(result.competencies.discourseFluency >= 0 && result.competencies.discourseFluency <= 100);
    assert.ok(result.competencies.syntacticControl >= 0 && result.competencies.syntacticControl <= 100);
    assert.ok(result.competencies.lexicalPrecision >= 0 && result.competencies.lexicalPrecision <= 100);
    assert.ok(result.competencies.phonologicalControl >= 0 && result.competencies.phonologicalControl <= 100);
  });

  it('assigns lower CEFR level (A1/A2) when error count is high and pace is low', () => {
    const stats = {
      durationSeconds: 120,
      durationFormatted: '2m 0s',
      learnerTurns: 2,
      learnerWords: 15,
      estimatedWpm: 12,
    };

    const result = calculateLocalCEFRScores(stats, 4, 0);
    assert.ok(result.overallScore < 60);
    assert.ok(result.cefrLevel === 'A1' || result.cefrLevel === 'A2');
  });

  it('assigns higher CEFR level (B2/C1) when pace is brisk and errors are minimal', () => {
    const stats = {
      durationSeconds: 120,
      durationFormatted: '2m 0s',
      learnerTurns: 6,
      learnerWords: 240,
      estimatedWpm: 120,
    };

    const result = calculateLocalCEFRScores(stats, 0, 4);
    assert.ok(result.overallScore >= 75);
    assert.ok(result.cefrLevel === 'B2' || result.cefrLevel === 'C1');
  });
});

describe('ReportService - Plan Recommendation Engine', () => {
  it('recommends Programa Essential for A1/A2 or score < 60', () => {
    const plan = matchRecommendedPlan('A2', 52);
    assert.strictEqual(plan.id, 'essential');
    assert.strictEqual(plan.name, 'Programa Essential');
    assert.ok(plan.whatsappMessage.includes('Programa Essential'));
    assert.ok(plan.whatsappMessage.includes('52/100'));
  });

  it('recommends Programa Pro for B1/B2 intermediate', () => {
    const plan = matchRecommendedPlan('B1', 72);
    assert.strictEqual(plan.id, 'pro');
    assert.ok(plan.name.includes('Programa Pro'));
    assert.ok(plan.whatsappMessage.includes('Programa Pro'));
    assert.ok(plan.whatsappMessage.includes('72/100'));
  });

  it('recommends Executive Partner for C1 or score >= 85', () => {
    const plan = matchRecommendedPlan('C1', 92);
    assert.strictEqual(plan.id, 'executive');
    assert.strictEqual(plan.name, 'Executive Partner');
    assert.ok(plan.whatsappMessage.includes('Executive Partner'));
    assert.ok(plan.whatsappMessage.includes('92/100'));
  });
});

describe('ReportService - Session Stats Calculation & Short Session Guard', () => {
  it('correctly calculates turns, words, and estimated WPM', () => {
    const turns: TurnData[] = [
      { role: 'user', content: 'Hello Teacher Ivan, how are you today?' },
      { role: 'assistant', content: 'I am doing well! Tell me about yourself.' },
      { role: 'user', content: 'I am a software engineer working on an AI prototype.' },
    ];

    const stats = calculateSessionStats(turns, 60);
    assert.strictEqual(stats.learnerTurns, 2);
    assert.strictEqual(stats.learnerWords, 17);
    assert.strictEqual(stats.estimatedWpm, 17);
    assert.strictEqual(stats.durationFormatted, '1m 0s');
    assert.strictEqual(isSessionTooShort(stats.learnerTurns, stats.learnerWords), false);
  });

  it('flags session as too short when turns < 2 or words < 8', () => {
    assert.strictEqual(isSessionTooShort(1, 10), true);
    assert.strictEqual(isSessionTooShort(2, 6), true);
    assert.strictEqual(isSessionTooShort(3, 15), false);
  });
});
