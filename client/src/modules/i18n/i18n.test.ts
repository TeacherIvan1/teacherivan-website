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

  it('contains parallel translations for Bichronous Coaching sections and Assessment Modal', () => {
    // Assessment Modal
    assert.ok(translations.en.assessmentModal.title);
    assert.ok(translations.es.assessmentModal.title);
    assert.ok(translations.en.assessmentModal.skipBtn);
    assert.ok(translations.es.assessmentModal.skipBtn);

    // KPI Strip
    assert.strictEqual(translations.en.kpiStrip.sttMetric, '>75%');
    assert.strictEqual(translations.es.kpiStrip.sttMetric, '>75%');
    assert.ok(translations.en.kpiStrip.planMetric);
    assert.ok(translations.es.kpiStrip.planMetric);

    // Market Comparison
    assert.ok(translations.en.marketComparison.title);
    assert.ok(translations.es.marketComparison.title);
    assert.ok(translations.en.marketComparison.ivan.name);
    assert.ok(translations.es.marketComparison.ivan.name);

    // Session Architecture
    assert.ok(translations.en.sessionArchitecture.title);
    assert.ok(translations.es.sessionArchitecture.title);
    assert.ok(translations.en.sessionArchitecture.phase1Title);
    assert.ok(translations.es.sessionArchitecture.phase1Title);

    // Async Sprint
    assert.ok(translations.en.asyncSprint.title);
    assert.ok(translations.es.asyncSprint.title);
    assert.ok(translations.en.asyncSprint.day1Title);
    assert.ok(translations.es.asyncSprint.day1Title);

    // Pricing & Plans
    assert.ok(translations.en.pricingPlans.title);
    assert.ok(translations.es.pricingPlans.title);
    assert.ok(translations.en.pricingPlans.pro.name);
    assert.ok(translations.es.pricingPlans.pro.name);
    assert.ok(translations.en.pricingPlans.essential.name);
    assert.ok(translations.es.pricingPlans.essential.name);
    assert.ok(translations.en.pricingPlans.executive.name);
    assert.ok(translations.es.pricingPlans.executive.name);
  });

  it('contains parallel translations for new scenarios (daily-routine & scholarship-interview)', () => {
    // English scenarios
    assert.ok(translations.en.scenarios['daily-routine']?.title);
    assert.ok(translations.en.scenarios['daily-routine']?.desc);
    assert.ok(translations.en.scenarios['scholarship-interview']?.title);
    assert.ok(translations.en.scenarios['scholarship-interview']?.desc);

    // Spanish scenarios
    assert.ok(translations.es.scenarios['daily-routine']?.title);
    assert.ok(translations.es.scenarios['daily-routine']?.desc);
    assert.ok(translations.es.scenarios['scholarship-interview']?.title);
    assert.ok(translations.es.scenarios['scholarship-interview']?.desc);
  });

  it('contains reassurance notice, doneSpeaking button, and dynamic placeholders in en and es', () => {
    // English transcript strings
    assert.ok(translations.en.transcript.reassuranceNotice.includes('AI tutor listens to your real voice'));
    assert.strictEqual(translations.en.transcript.doneSpeaking, 'Done Speaking');
    assert.ok(translations.en.transcript.placeholderConnectedIvan.includes('Teacher Ivan'));
    assert.ok(translations.en.transcript.placeholderConnectedEmma.includes('Emma'));

    // Spanish transcript strings
    assert.ok(translations.es.transcript.reassuranceNotice.includes('El tutor IA escucha tu voz real'));
    assert.strictEqual(translations.es.transcript.doneSpeaking, 'Listo');
    assert.ok(translations.es.transcript.placeholderConnectedIvan.includes('Teacher Ivan'));
    assert.ok(translations.es.transcript.placeholderConnectedEmma.includes('Emma'));
  });

  it('contains 5 navigation tabs and complete asyncSprint bilingual keys in en and es', () => {
    // 5 Navigation Tabs
    assert.strictEqual(translations.en.nav.overview, 'Overview');
    assert.strictEqual(translations.es.nav.overview, 'Inicio');
    assert.strictEqual(translations.en.nav.simulator, 'AI Simulator');
    assert.strictEqual(translations.es.nav.simulator, 'Simulador IA');
    assert.strictEqual(translations.en.nav.resources, 'Resources');
    assert.strictEqual(translations.es.nav.resources, 'Recursos');
    assert.strictEqual(translations.en.nav.games, 'Games');
    assert.strictEqual(translations.es.nav.games, 'Juegos');
    assert.strictEqual(translations.en.nav.methodology, 'Method');
    assert.strictEqual(translations.es.nav.methodology, 'Método');

    // Async Sprint Bilingual Keys
    assert.strictEqual(translations.en.asyncSprint.microLearningTitle, 'Micro-Learning That Fits Your Schedule');
    assert.strictEqual(translations.es.asyncSprint.microLearningTitle, 'Micro-Aprendizaje Adaptado a Tu Horario');
    assert.ok(translations.en.asyncSprint.microLearningDesc.includes('Fluency is not built'));
    assert.ok(translations.es.asyncSprint.microLearningDesc.includes('La fluidez no se construye'));
    assert.strictEqual(translations.en.asyncSprint.badgeDailyRecasts, 'Daily Audio Recasts');
    assert.strictEqual(translations.es.asyncSprint.badgeDailyRecasts, 'Recasting en Audio Diario');
    assert.strictEqual(translations.en.asyncSprint.badgeNeuroplastic, 'Neuroplastic Retention');
    assert.strictEqual(translations.es.asyncSprint.badgeNeuroplastic, 'Retención Neuroplástica');
    assert.strictEqual(translations.en.asyncSprint.badgeZeroCommute, 'Zero Commute Time');
    assert.strictEqual(translations.es.asyncSprint.badgeZeroCommute, 'Sin Pérdida de Tiempo en Traslados');
    assert.strictEqual(translations.en.asyncSprint.showcaseBadge1, '5-Day Voice Sprint 🚀');
    assert.strictEqual(translations.es.asyncSprint.showcaseBadge1, 'Sprint de Voz de 5 Días 🚀');
    assert.strictEqual(translations.en.asyncSprint.showcaseBadge2, 'Daily 10–15m Micro-Habit ⏱️');
    assert.strictEqual(translations.es.asyncSprint.showcaseBadge2, 'Micro-Hábito Diario 10–15m ⏱️');
    assert.ok(translations.en.asyncSprint.showcaseCaption.includes('Collaborative Asynchronous Sprints'));
    assert.ok(translations.es.asyncSprint.showcaseCaption.includes('Sprints Asíncronos Colaborativos'));
    assert.ok(translations.en.asyncSprint.day1Highlight);
    assert.ok(translations.es.asyncSprint.day1Highlight);
  });

  it('contains parallel translations for resourcesView, gamesView, and sprintDashboard', () => {
    // Resources View
    assert.ok(translations.en.resourcesView.title);
    assert.ok(translations.es.resourcesView.title);
    assert.ok(translations.en.resourcesView.readingsTitle);
    assert.ok(translations.es.resourcesView.readingsTitle);
    assert.ok(translations.en.resourcesView.listeningsTitle);
    assert.ok(translations.es.resourcesView.listeningsTitle);

    // Games View
    assert.ok(translations.en.gamesView.title);
    assert.ok(translations.es.gamesView.title);
    assert.ok(translations.en.gamesView.tabRecast);
    assert.ok(translations.es.gamesView.tabRecast);
    assert.ok(translations.en.gamesView.tabMatcher);
    assert.ok(translations.es.gamesView.tabMatcher);
    assert.ok(translations.en.gamesView.tabBuilder);
    assert.ok(translations.es.gamesView.tabBuilder);

    // Sprint Dashboard
    assert.ok(translations.en.sprintDashboard.title);
    assert.ok(translations.es.sprintDashboard.title);
    assert.ok(translations.en.sprintDashboard.reportTitle);
    assert.ok(translations.es.sprintDashboard.reportTitle);
    assert.ok(translations.en.sprintDashboard.sendToIvan.includes('+591 72878330'));
    assert.ok(translations.es.sprintDashboard.sendToIvan.includes('+591 72878330'));
  });

  it('contains parallel translations for authModal (registration & profile completion)', () => {
    assert.ok(translations.en.authModal.titleSignUp);
    assert.ok(translations.es.authModal.titleSignUp);
    assert.ok(translations.en.authModal.googleBtn);
    assert.ok(translations.es.authModal.googleBtn);
    assert.ok(translations.en.authModal.fullNameLabel);
    assert.ok(translations.es.authModal.fullNameLabel);
    assert.ok(translations.en.authModal.dobLabel);
    assert.ok(translations.es.authModal.dobLabel);
    assert.ok(translations.en.authModal.countryLabel);
    assert.ok(translations.es.authModal.countryLabel);
    assert.ok(translations.en.authModal.saveScoreAndUnlock);
    assert.ok(translations.es.authModal.saveScoreAndUnlock);
    assert.ok(translations.en.authModal.reconnecting);
    assert.ok(translations.es.authModal.reconnecting);
    assert.ok(translations.en.authModal.tabSignIn);
    assert.ok(translations.es.authModal.tabSignIn);
    assert.ok(translations.en.authModal.passwordLabel);
    assert.ok(translations.es.authModal.passwordLabel);
  });

  it('contains parallel translations for mandatoryGoalsModal in en and es', () => {
    assert.ok(translations.en.mandatoryGoalsModal.badge);
    assert.ok(translations.es.mandatoryGoalsModal.badge);
    assert.ok(translations.en.mandatoryGoalsModal.title);
    assert.ok(translations.es.mandatoryGoalsModal.title);
    assert.ok(translations.en.mandatoryGoalsModal.levelLabel);
    assert.ok(translations.es.mandatoryGoalsModal.levelLabel);
    assert.ok(translations.en.mandatoryGoalsModal.primaryGoalLabel);
    assert.ok(translations.es.mandatoryGoalsModal.primaryGoalLabel);
    assert.ok(translations.en.mandatoryGoalsModal.focusSkillLabel);
    assert.ok(translations.es.mandatoryGoalsModal.focusSkillLabel);
    assert.ok(translations.en.mandatoryGoalsModal.personalObjectiveLabel);
    assert.ok(translations.es.mandatoryGoalsModal.personalObjectiveLabel);
    assert.ok(translations.en.mandatoryGoalsModal.submitBtn);
    assert.ok(translations.es.mandatoryGoalsModal.submitBtn);
  });

  it('contains parallel translations for scheduling in en and es', () => {
    assert.ok(translations.en.scheduling.navTab);
    assert.ok(translations.es.scheduling.navTab);
    assert.ok(translations.en.scheduling.title);
    assert.ok(translations.es.scheduling.title);
    assert.ok(translations.en.scheduling.currentWeek);
    assert.ok(translations.es.scheduling.currentWeek);
    assert.ok(translations.en.scheduling.nextWeek);
    assert.ok(translations.es.scheduling.nextWeek);
    assert.ok(translations.en.scheduling.confirmWhatsApp.includes('+591 72878330'));
    assert.ok(translations.es.scheduling.confirmWhatsApp.includes('+591 72878330'));
    assert.ok(translations.en.scheduling.quickBookBtn);
    assert.ok(translations.es.scheduling.quickBookBtn);
    assert.ok(translations.en.scheduling.adminBookingsTitle);
    assert.ok(translations.es.scheduling.adminBookingsTitle);
  });
});
