import { describe, it } from 'node:test';
import assert from 'node:assert';
import { useLanguageStore } from './languageStore';
import { translations } from './translations';

describe('i18n Language Module', () => {
  it('defaults to Spanish (es)', () => {
    const state = useLanguageStore.getState();
    assert.strictEqual(state.lang, 'es');
    assert.strictEqual(state.translations.nav.voiceTutor, 'Tutor de Voz IA');
  });

  it('switches language cleanly to English (en)', () => {
    useLanguageStore.getState().setLang('en');
    const state = useLanguageStore.getState();
    assert.strictEqual(state.lang, 'en');
    assert.strictEqual(state.translations.nav.voiceTutor, 'AI Voice Tutor');
    assert.strictEqual(state.translations.howToUse.title, 'How to Use the Voice Tutor Simulator');
  });

  it('toggles back and forth between en and es', () => {
    useLanguageStore.getState().setLang('en');
    useLanguageStore.getState().toggleLang();
    assert.strictEqual(useLanguageStore.getState().lang, 'es');
    assert.strictEqual(useLanguageStore.getState().translations.howToUse.title, 'Cómo Usar el Simulador de Voz');

    useLanguageStore.getState().toggleLang();
    assert.strictEqual(useLanguageStore.getState().lang, 'en');
    assert.strictEqual(useLanguageStore.getState().translations.howToUse.title, 'How to Use the Voice Tutor Simulator');

    // Reset back to default 'es'
    useLanguageStore.getState().setLang('es');
  });

  it('contains parallel translations for all 4 simulator steps in both en and es', () => {
    assert.ok(translations.en.howToUse.step1.title);
    assert.ok(translations.en.howToUse.step2.title);
    assert.ok(translations.en.howToUse.step3.title);
    assert.ok(translations.en.howToUse.step4.title);

    assert.ok(translations.es.howToUse.step1.title);
    assert.ok(translations.es.howToUse.step2.title);
    assert.ok(translations.es.howToUse.step3.title);
    assert.ok(translations.es.howToUse.step4.title);
  });

  it('contains parallel translations for tutor personas (Teacher Ivan & Emma) in en and es', () => {
    // English persona checks
    assert.ok(translations.en.persona.heading);
    assert.ok(translations.en.persona.teacherIvan.name);
    assert.ok(translations.en.persona.teacherIvan.voiceLabel.includes('Puck'));
    assert.ok(translations.en.persona.teacherIvan.role);
    assert.ok(translations.en.persona.emma.name);
    assert.ok(translations.en.persona.emma.voiceLabel.includes('Aoede'));
    assert.ok(translations.en.persona.emma.role);

    // Spanish persona checks
    assert.ok(translations.es.persona.heading);
    assert.ok(translations.es.persona.teacherIvan.name);
    assert.ok(translations.es.persona.teacherIvan.voiceLabel.includes('Puck'));
    assert.ok(translations.es.persona.teacherIvan.role);
    assert.ok(translations.es.persona.emma.name);
    assert.ok(translations.es.persona.emma.voiceLabel.includes('Aoede'));
    assert.ok(translations.es.persona.emma.role);
  });

  it('contains parallel translations for interactive 2D avatar stage in en and es', () => {
    assert.ok(translations.en.avatarStage.idle);
    assert.ok(translations.en.avatarStage.listening);
    assert.ok(translations.en.avatarStage.speaking);

    assert.ok(translations.es.avatarStage.idle);
    assert.ok(translations.es.avatarStage.listening);
    assert.ok(translations.es.avatarStage.speaking);
  });
});
