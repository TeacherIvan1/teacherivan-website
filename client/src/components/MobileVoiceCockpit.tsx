import React, { useState, useEffect } from 'react';
import {
  Mic,
  Square,
  MessageSquare,
  Sparkles,
  ChevronDown,
  X,
  ArrowLeft,
  Check,
  Loader2,
  Lock,
} from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { useAuthStore } from '../modules/auth/authStore';
import { useTheme } from '../modules/theme/ThemeContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { ChibiAvatar, AvatarMood } from './ChibiAvatar';
import { ChatTranscript } from './ChatTranscript';
import { trackEvent } from '../utils/analytics';

export interface MobileVoiceCockpitProps {
  onBack?: () => void;
}

type BottomSheetType = null | 'level' | 'scenario' | 'transcript';

const LEVEL_OPTIONS = [
  { id: 'diag', labelEs: 'Diagnóstico 90s', labelEn: '90s Diagnostic', short: '90s' },
  { id: 'a1', labelEs: 'A1 • Principiante', labelEn: 'A1 • Beginner', short: 'A1' },
  { id: 'a2', labelEs: 'A2 • Elemental', labelEn: 'A2 • Elementary', short: 'A2' },
  { id: 'b1', labelEs: 'B1 • Intermedio', labelEn: 'B1 • Intermediate', short: 'B1' },
  { id: 'b2', labelEs: 'B2 • Intermedio Alto', labelEn: 'B2 • Upper-Int', short: 'B2' },
  { id: 'c1', labelEs: 'C1 • Avanzado / IELTS', labelEn: 'C1 • Advanced / IELTS', short: 'C1' },
] as const;

export const MobileVoiceCockpit: React.FC<MobileVoiceCockpitProps> = ({ onBack }) => {
  const { isEs, t } = useTranslation();
  const { isDark } = useTheme();
  const { isAuthenticated, openAuthModal, checkAndIncrementSessionQuota } = useAuthStore();
  const {
    status,
    messages,
    micLevel,
    isTutorSpeaking,
    isUserSpeaking,
    isThinking,
    errorMessage,
    startSession,
    stopSession,
    clearError,
  } = useConversationStore();

  const {
    persona,
    level,
    correctionMode,
    selectedScenarioId,
    availableScenarios,
    setPersona,
    setLevel,
    setCorrectionMode,
    selectScenario,
  } = useTeachingStore();

  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null);
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);

  useScrollLock(activeSheet !== null);

  useEffect(() => {
    if (!activeSheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveSheet(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeSheet]);

  const isConnected = status === 'connected';
  const isPending = status === 'requesting_token' || status === 'connecting';

  const avatarMood: AvatarMood = isTutorSpeaking
    ? 'speaking'
    : isThinking || isPending
    ? 'thinking'
    : isConnected && (isUserSpeaking || micLevel > 4)
    ? 'listening'
    : 'idle';

  const normalizedAudio = isTutorSpeaking
    ? Math.max(0.35, Math.min(1, micLevel / 45))
    : Math.min(1, micLevel / 60);

  const haloScale = 1 + normalizedAudio * 0.14;

  const activeScenario =
    availableScenarios.find((s) => s.id === selectedScenarioId) || availableScenarios[0];

  const currentLevelShort =
    selectedScenarioId === 'diagnostic-placement'
      ? '90s'
      : level === 'beginner'
      ? 'A2'
      : level === 'advanced'
      ? 'C1'
      : 'B1';

  const latestSubtitle =
    [...messages].reverse().find((m) => m.content && m.content.trim().length > 0)?.content.trim() ||
    (isEs
      ? 'Toca el micrófono para comenzar tu práctica hablada en vivo.'
      : 'Tap the microphone to start your live speaking practice.');

  const statusText = isPending
    ? isEs
      ? 'Conectando...'
      : 'Connecting...'
    : isTutorSpeaking
    ? isEs
      ? 'Hablando...'
      : 'Speaking...'
    : isThinking
    ? isEs
      ? 'Pensando...'
      : 'Thinking...'
    : isConnected
    ? isEs
      ? 'Escuchando...'
      : 'Listening...'
    : isEs
    ? 'Listo para practicar'
    : 'Ready to practice';

  const handleToggleMic = () => {
    setQuotaNotice(null);
    clearError();
    if (isConnected || isPending) {
      stopSession();
      return;
    }
    const quota = checkAndIncrementSessionQuota();
    if (!quota.allowed) {
      setQuotaNotice(
        isEs
          ? `Límite diario alcanzado (${quota.used}/${quota.max}). Mejora tu plan por WhatsApp.`
          : `Daily limit reached (${quota.used}/${quota.max}). Upgrade via WhatsApp.`
      );
      return;
    }
    trackEvent('voice_tutor_launch', {
      tutor: persona === 'emma' ? 'emma' : 'ivan',
      level,
    });
    startSession();
  };

  const handleSelectLevel = (id: (typeof LEVEL_OPTIONS)[number]['id']) => {
    setActiveSheet(null);
    if (!isAuthenticated && id !== 'diag') {
      openAuthModal('signup', undefined, t.authModal.tierLockBanner);
      return;
    }
    if (id === 'diag') {
      selectScenario('diagnostic-placement');
    } else if (id === 'a1' || id === 'a2') {
      setLevel('beginner');
      if (selectedScenarioId === 'diagnostic-placement') selectScenario('casual-coffee');
    } else if (id === 'b1' || id === 'b2') {
      setLevel('intermediate');
      if (selectedScenarioId === 'diagnostic-placement') selectScenario('job-interview');
    } else {
      setLevel('advanced');
      if (selectedScenarioId === 'diagnostic-placement') selectScenario('ielts-speaking');
    }
  };

  const handleSelectScenario = (scenarioId: string) => {
    setActiveSheet(null);
    if (!isAuthenticated && scenarioId !== 'diagnostic-placement') {
      openAuthModal('signup', undefined, t.authModal.tierLockBanner);
      return;
    }
    selectScenario(scenarioId);
  };

  return (
    <div
      id="mobile-voice-cockpit"
      data-testid="mobile-voice-cockpit"
      className={`h-full w-full flex flex-col justify-between overflow-hidden px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] ${
        isDark ? 'bg-[#091326] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#1A3153]'
      }`}
    >
      {/* ZONE 1: Compact Single-Row Config Pill Strip (~48px) */}
      <div className="flex items-center gap-2 shrink-0">
        {onBack && (
          <button
            id="mobile-cockpit-back-btn"
            type="button"
            onClick={() => {
              if (isConnected) stopSession();
              onBack();
            }}
            aria-label={isEs ? 'Volver al inicio' : 'Back to home'}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 cursor-pointer border ${
              isDark
                ? 'bg-[#132642] text-[#FAFAFA] border-[#A7C7E7]/25'
                : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/20'
            }`}
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
        )}

        {/* Pill 1: Tutor 1-Tap Toggle */}
        <button
          id="mobile-pill-tutor"
          type="button"
          onClick={() => setPersona(persona === 'emma' ? 'teacher-ivan' : 'emma')}
          className={`min-h-[44px] px-3 rounded-full font-montserrat font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer border transition-colors ${
            isDark
              ? 'bg-[#132642] text-[#FAFAFA] border-[#E09B30]/50'
              : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#E09B30]" aria-hidden="true" />
          <span>{persona === 'emma' ? 'Emma' : 'Ivan'}</span>
        </button>

        {/* Pill 2: Level Selector */}
        <button
          id="mobile-pill-level"
          type="button"
          onClick={() => setActiveSheet('level')}
          className={`min-h-[44px] px-3 rounded-full font-montserrat font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer border ${
            isDark
              ? 'bg-[#132642] text-[#A7C7E7] border-[#A7C7E7]/25'
              : 'bg-[#EEF3F8] text-[#1A3153] border-[#1A3153]/20'
          }`}
        >
          <span>{isEs ? `Nivel: ${currentLevelShort}` : `Level: ${currentLevelShort}`}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>

        {/* Pill 3: Scenario Selector */}
        <button
          id="mobile-pill-scenario"
          type="button"
          onClick={() => setActiveSheet('scenario')}
          className={`min-h-[44px] flex-1 min-w-0 px-3 rounded-full font-montserrat font-bold text-xs flex items-center justify-between gap-1 cursor-pointer border ${
            isDark
              ? 'bg-[#132642] text-[#FAFAFA] border-[#A7C7E7]/25'
              : 'bg-[#EEF3F8] text-[#1A3153] border-[#1A3153]/20'
          }`}
        >
          <span className="truncate">
            {activeScenario ? activeScenario.title : isEs ? 'Escenario' : 'Scenario'}
          </span>
          <ChevronDown size={14} className="shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* ZONE 2: Centered Editorial Avatar & Live Feedback Stage (flex-1 min-h-0) */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 py-2">
        {/* Reactive Circular Acoustic Halo + Editorial Vector Rig */}
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none transition-transform duration-150"
            style={{
              width: 'clamp(196px, 31dvh, 266px)',
              height: 'clamp(196px, 31dvh, 266px)',
              transform: `scale(${haloScale.toFixed(3)})`,
              background: isTutorSpeaking
                ? 'radial-gradient(circle, rgba(224,155,48,0.34) 0%, rgba(224,155,48,0) 70%)'
                : isConnected
                ? 'radial-gradient(circle, rgba(167,199,231,0.30) 0%, rgba(26,49,83,0) 70%)'
                : 'radial-gradient(circle, rgba(26,49,83,0.22) 0%, transparent 70%)',
            }}
          />
          <div
            className={`relative rounded-full overflow-hidden border-2 shadow-2xl ${
              isTutorSpeaking
                ? 'border-[#E09B30]'
                : isConnected
                ? 'border-[#A7C7E7]'
                : isDark
                ? 'border-[#A7C7E7]/30'
                : 'border-[#1A3153]/25'
            } bg-[#0F203D]`}
            style={{
              width: 'clamp(176px, 28dvh, 240px)',
              height: 'clamp(176px, 28dvh, 240px)',
            }}
          >
            <ChibiAvatar
              character={persona === 'emma' ? 'emma' : 'teacher-ivan'}
              mood={avatarMood}
              audioLevel={normalizedAudio}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Crisp Status Pill */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider border ${
            isTutorSpeaking
              ? 'bg-[#E09B30] text-[#091326] border-[#E09B30]'
              : isConnected
              ? 'bg-[#1A3153] text-[#FAFAFA] border-[#A7C7E7]/40'
              : isDark
              ? 'bg-[#132642] text-[#A7C7E7] border-[#A7C7E7]/25'
              : 'bg-[#EEF3F8] text-[#1A3153] border-[#1A3153]/20'
          }`}
        >
          {isPending ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#10B981] animate-pulse' : 'bg-[#E09B30]'
              }`}
              aria-hidden="true"
            />
          )}
          <span>{statusText}</span>
        </div>

        {/* Compact 2-Line Live Subtitle / Recast Preview (Tappable to open Transcript Sheet) */}
        <button
          type="button"
          onClick={() => setActiveSheet('transcript')}
          className={`w-full max-w-sm px-4 py-2.5 rounded-2xl text-center border cursor-pointer transition-colors ${
            isDark
              ? 'bg-[#132642]/90 border-[#A7C7E7]/25 text-[#FAFAFA]'
              : 'bg-[#FFFFFF] border-[#1A3153]/16 text-[#1A3153] shadow-sm'
          }`}
        >
          <p className="font-inter text-sm leading-snug line-clamp-2">
            {quotaNotice || errorMessage || latestSubtitle}
          </p>
        </button>
      </div>

      {/* ZONE 3: Ergonomic Bottom Control Dock (~84px) */}
      <div className="shrink-0 flex items-center justify-center gap-7 pt-1 pb-1">
        {/* Left: Transcript Sheet */}
        <button
          id="mobile-dock-transcript-btn"
          type="button"
          onClick={() => setActiveSheet('transcript')}
          aria-label={isEs ? 'Ver transcripción' : 'Open transcript'}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border transition-colors ${
            isDark
              ? 'bg-[#132642] text-[#FAFAFA] border-[#A7C7E7]/30 hover:border-[#E09B30]'
              : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25 hover:bg-[#EEF3F8]'
          }`}
        >
          <MessageSquare size={20} aria-hidden="true" />
        </button>

        {/* Center: Primary 60x60px Talk / Stop Mic FAB */}
        <button
          id="mobile-dock-mic-fab"
          type="button"
          onClick={handleToggleMic}
          aria-label={
            isConnected
              ? isEs
                ? 'Detener sesión de voz'
                : 'Stop voice session'
              : isEs
              ? 'Iniciar sesión de voz'
              : 'Start voice session'
          }
          className={`w-[60px] h-[60px] rounded-full flex items-center justify-center cursor-pointer shadow-xl border-0 transition-transform active:scale-95 ${
            isConnected
              ? 'bg-[#DC2626] text-[#FAFAFA]'
              : 'bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326]'
          }`}
        >
          {isPending ? (
            <Loader2 size={26} className="animate-spin" aria-hidden="true" />
          ) : isConnected ? (
            <Square size={22} fill="currentColor" aria-hidden="true" />
          ) : (
            <Mic size={26} aria-hidden="true" />
          )}
        </button>

        {/* Right: Toggle Coaching / Conversation Mode */}
        <button
          id="mobile-dock-mode-btn"
          type="button"
          onClick={() =>
            setCorrectionMode(correctionMode === 'coaching' ? 'conversation' : 'coaching')
          }
          aria-label={
            correctionMode === 'coaching'
              ? isEs
                ? 'Modo Corrección Activa (toca para cambiar)'
                : 'Coaching mode (tap to switch)'
              : isEs
              ? 'Modo Conversación Libre (toca para cambiar)'
              : 'Conversation mode (tap to switch)'
          }
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border transition-colors ${
            correctionMode === 'coaching'
              ? 'bg-[#1A3153] text-[#E09B30] border-[#E09B30]'
              : isDark
              ? 'bg-[#132642] text-[#A7C7E7] border-[#A7C7E7]/30'
              : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25'
          }`}
        >
          <Sparkles size={20} aria-hidden="true" />
        </button>
      </div>

      {/* SLEEK BOTTOM SHEETS (Level / Scenario / Transcript) */}
      {activeSheet && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[95] flex items-end justify-center bg-[#091326]/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveSheet(null);
          }}
        >
          <div
            className={`w-full max-w-md max-h-[72dvh] rounded-t-3xl p-5 flex flex-col gap-4 overflow-y-auto overscroll-contain shadow-2xl ${
              isDark
                ? 'bg-[#132642] text-[#FAFAFA] border-t border-[#A7C7E7]/25'
                : 'bg-[#FFFFFF] text-[#1A3153] border-t border-[#1A3153]/18'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-montserrat font-bold text-base">
                {activeSheet === 'level'
                  ? isEs
                    ? 'Selecciona tu Nivel'
                    : 'Select Your Level'
                  : activeSheet === 'scenario'
                  ? isEs
                    ? 'Elige un Escenario'
                    : 'Choose a Scenario'
                  : isEs
                  ? 'Transcripción en Vivo'
                  : 'Live Transcript'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                aria-label={isEs ? 'Cerrar' : 'Close'}
                className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer ${
                  isDark ? 'bg-[#091326] text-[#FAFAFA]' : 'bg-[#EEF3F8] text-[#1A3153]'
                }`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {activeSheet === 'level' && (
              <div className="grid grid-cols-2 gap-2.5">
                {LEVEL_OPTIONS.map((opt) => {
                  const locked = !isAuthenticated && opt.id !== 'diag';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectLevel(opt.id)}
                      className={`min-h-[48px] px-3 py-2.5 rounded-2xl text-left font-montserrat font-bold text-xs flex items-center justify-between gap-2 cursor-pointer border ${
                        currentLevelShort === opt.short
                          ? 'bg-[#E09B30] text-[#091326] border-[#E09B30]'
                          : isDark
                          ? 'bg-[#091326] text-[#FAFAFA] border-[#A7C7E7]/25'
                          : 'bg-[#EEF3F8] text-[#1A3153] border-[#1A3153]/16'
                      }`}
                    >
                      <span>{isEs ? opt.labelEs : opt.labelEn}</span>
                      {locked ? <Lock size={13} aria-hidden="true" /> : currentLevelShort === opt.short && <Check size={14} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}

            {activeSheet === 'scenario' && (
              <div className="grid grid-cols-2 gap-2.5">
                {availableScenarios.slice(0, 6).map((sc) => {
                  const locked = !isAuthenticated && sc.id !== 'diagnostic-placement';
                  const active = sc.id === selectedScenarioId;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleSelectScenario(sc.id)}
                      className={`min-h-[52px] p-3 rounded-2xl text-left font-montserrat font-bold text-xs flex items-center justify-between gap-2 cursor-pointer border ${
                        active
                          ? 'bg-[#E09B30] text-[#091326] border-[#E09B30]'
                          : isDark
                          ? 'bg-[#091326] text-[#FAFAFA] border-[#A7C7E7]/25'
                          : 'bg-[#EEF3F8] text-[#1A3153] border-[#1A3153]/16'
                      }`}
                    >
                      <span className="line-clamp-2">{sc.title}</span>
                      {locked && <Lock size={13} className="shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}

            {activeSheet === 'transcript' && (
              <div className="min-h-[220px]">
                <ChatTranscript />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileVoiceCockpit;
