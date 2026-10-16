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
});
