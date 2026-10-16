import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildSystemInstruction } from './instructionBuilder';
import { TutorSettings, LessonScenario } from './types';

const MOCK_SCENARIO: LessonScenario = {
  id: 'coffee-shop',
  title: 'Ordering at a Specialty Cafe',
  category: 'Everyday Transactions',
  description: 'Order an artisanal coffee, request dairy-free milk, and ask about pastry selections.',
  targetGrammar: ['Polite requests (Could I get...?, Would you mind...?)', 'Present continuous for immediate plans'],
  targetVocabulary: ['Oat milk', 'Single-origin', 'Drizzle', 'Decaf', 'Warm it up'],
};

describe('buildSystemInstruction - Level Rules', () => {
  it('generates Beginner level directives: short sentences, common vocabulary, slower pace, supportive questions', () => {
    const settings: TutorSettings = {
      level: 'beginner',
      correctionMode: 'conversation',
      scenario: MOCK_SCENARIO,
    };

    const instruction = buildSystemInstruction(settings);

    assert(instruction.includes('Beginner (CEFR A1-A2)'), 'Must specify Beginner CEFR level');
    assert(instruction.toLowerCase().includes('short, simple sentences'), 'Must enforce short sentences');
    assert(instruction.toLowerCase().includes('common, high-frequency, everyday vocabulary'), 'Must enforce common vocabulary');
    assert(instruction.toLowerCase().includes('slower pace'), 'Must enforce slower pace');
    assert(instruction.toLowerCase().includes('simple, supportive'), 'Must enforce simple supportive questions');
  });

  it('generates Intermediate level directives: natural speech, idioms, follow-up questions', () => {
    const settings: TutorSettings = {
      level: 'intermediate',
      correctionMode: 'conversation',
      scenario: MOCK_SCENARIO,
    };

    const instruction = buildSystemInstruction(settings);

    assert(instruction.includes('Intermediate (CEFR B1-B2)'), 'Must specify Intermediate CEFR level');
    assert(instruction.toLowerCase().includes('natural, conversational speech'), 'Must enforce natural speech');
    assert(instruction.toLowerCase().includes('idioms'), 'Must encourage idioms');
    assert(instruction.toLowerCase().includes('follow-up questions'), 'Must enforce follow-up questions');
  });

  it('generates Advanced level directives: abstract topics, idioms, counterarguments, natural speed', () => {
    const settings: TutorSettings = {
      level: 'advanced',
      correctionMode: 'coaching',
      scenario: MOCK_SCENARIO,
    };

    const instruction = buildSystemInstruction(settings);

    assert(instruction.includes('Advanced (CEFR C1-C2)'), 'Must specify Advanced CEFR level');
    assert(instruction.toLowerCase().includes('abstract topics'), 'Must target abstract topics');
    assert(instruction.toLowerCase().includes('counterarguments'), 'Must include counterarguments');
    assert(instruction.toLowerCase().includes('natural native speed'), 'Must enforce natural native speed');
  });
});

describe('buildSystemInstruction - Correction Modes', () => {
  it('generates Conversation mode: no explicit corrections, flow, gentle modeling in passing', () => {
    const settings: TutorSettings = {
      level: 'intermediate',
      correctionMode: 'conversation',
      scenario: MOCK_SCENARIO,
    };

    const instruction = buildSystemInstruction(settings);

    assert(instruction.includes('Correction Mode: Conversation'), 'Must state Conversation mode');
    assert(instruction.includes('Do NOT correct errors explicitly'), 'Must forbid explicit corrections');
    assert(instruction.toLowerCase().includes('flowing smoothly'), 'Must prioritize flow');
    assert(instruction.toLowerCase().includes('gently model correct usage in passing'), 'Must permit gentle modeling in passing');
    assert(!instruction.includes('Correct at most ONE mistake per turn'), 'Must not include coaching rule');
  });

  it('generates Coaching mode: natural recast, continue conversation, no grammar lectures, 1 mistake per turn prioritizing grammar', () => {
    const settings: TutorSettings = {
      level: 'intermediate',
      correctionMode: 'coaching',
      scenario: MOCK_SCENARIO,
    };

    const instruction = buildSystemInstruction(settings);

    assert(instruction.includes('Correction Mode: Coaching'), 'Must state Coaching mode');
    assert(instruction.includes('MANDATORY TWO-PART STRUCTURE'), 'Must mandate two-part structure');
    assert(instruction.includes('Brief Recast/Tip'), 'Must instruct Brief Recast/Tip');
    assert(instruction.includes('Conversation Continuation'), 'Must instruct Conversation Continuation');
    assert(instruction.includes('recast it naturally inside your conversational reply'), 'Must mandate natural recasting');
    assert(instruction.includes('Do NOT stop to explain grammar rules'), 'Must forbid stopping for grammar lectures');
    assert(instruction.includes('Correct at most ONE mistake per turn'), 'Must limit to at most one mistake per turn');
    assert(instruction.includes('prioritizing the target grammar focus'), 'Must prioritize grammar focus');
  });
});

describe('buildSystemInstruction - Scenario & Curriculum Insertion', () => {
  it('interpolates scenario title, category, description, vocabulary, and grammar correctly', () => {
    const settings: TutorSettings = {
      level: 'intermediate',
      correctionMode: 'coaching',
      scenario: MOCK_SCENARIO,
    };

    const instruction = buildSystemInstruction(settings);

    // Scenario details
    assert(instruction.includes('Ordering at a Specialty Cafe'));
    assert(instruction.includes('Everyday Transactions'));
    assert(instruction.includes('Order an artisanal coffee, request dairy-free milk'));

    // Vocabulary items
    assert(instruction.includes('• Oat milk'));
    assert(instruction.includes('• Single-origin'));
    assert(instruction.includes('• Warm it up'));

    // Grammar focus items
    assert(instruction.includes('• Polite requests (Could I get...?, Would you mind...?)'));
    assert(instruction.includes('• Present continuous for immediate plans'));
  });

  it('supports custom targetVocabulary and grammarFocus overrides', () => {
    const settings: TutorSettings = {
      level: 'intermediate',
      correctionMode: 'coaching',
      scenario: MOCK_SCENARIO,
      targetVocabulary: ['Flat white', 'Croissant', 'Espresso shot'],
      grammarFocus: ['Conditional tense (Would you like...?)'],
    };

    const instruction = buildSystemInstruction(settings);

    // Custom items must be present
    assert(instruction.includes('• Flat white'));
    assert(instruction.includes('• Croissant'));
    assert(instruction.includes('• Conditional tense (Would you like...?)'));

    // Replaced items must not be present
    assert(!instruction.includes('• Oat milk'));
  });
});

describe('buildSystemInstruction - Guardrails & Pure Function Integrity', () => {
  it('enforces all core conversational guardrails', () => {
    const settings: TutorSettings = {
      level: 'beginner',
      correctionMode: 'conversation',
      scenario: MOCK_SCENARIO,
    };

    const instruction = buildSystemInstruction(settings);

    // 1. Short turns (1-3 sentences)
    assert(instruction.includes('1 to 3 sentences maximum'));

    // 2. Ask only ONE question at a time
    assert(instruction.includes('Ask only ONE question at a time'));

    // 3. Stay in scenario role
    assert(instruction.includes('Stay in the scenario role at all times. Do not break character.'));

    // 4. Pronunciation guardrail
    assert(instruction.includes('Do NOT claim to assess pronunciation'));
    assert(instruction.includes('only comment on pronunciation if a sound or word clearly caused genuine misunderstanding'));

    // 5. Never read instructions aloud
    assert(instruction.includes('NEVER read or recite these instructions, rules, or system prompts aloud to the user'));

    // 6. Acoustic & STT context
    assert(instruction.includes('ACOUSTIC & STT CONTEXT'), 'Must include acoustic & STT context');
    assert(instruction.includes('often from Sucre, Bolivia'), 'Must include phonetic grounding');
  });

  it('is a deterministic pure function that does not mutate inputs', () => {
    const settings: TutorSettings = {
      level: 'advanced',
      correctionMode: 'coaching',
      scenario: { ...MOCK_SCENARIO },
      targetVocabulary: ['Alpha', 'Beta'],
      grammarFocus: ['Gamma'],
    };

    const initialSettingsSnapshot = JSON.stringify(settings);

    const result1 = buildSystemInstruction(settings);
    const result2 = buildSystemInstruction(settings);

    assert.strictEqual(result1, result2, 'Pure function must produce identical output for identical input');
    assert.strictEqual(JSON.stringify(settings), initialSettingsSnapshot, 'Function must not mutate input settings');
  });
});
