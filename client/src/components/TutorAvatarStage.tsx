import React from 'react';
import { Mic, Volume2, Sparkles, Radio, Loader2 } from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { RiggedCharacter } from './RiggedCharacter';

export interface TutorAvatarStageProps {
  className?: string;
}

export const TutorAvatarStage: React.FC<TutorAvatarStageProps> = ({ className = '' }) => {
  const { status, isTutorSpeaking, isUserSpeaking, isThinking, micLevel, messages } = useConversationStore();
  const { persona } = useTeachingStore();
  const { t, isEs } = useTranslation();

  const isConnected = status === 'connected';
  const isPending = status === 'requesting_token' || status === 'connecting';

  // 1. Determine active audio & cognitive state
  const isSpeaking = isConnected && isTutorSpeaking;
  const isProcessing = isConnected && !isTutorSpeaking && (Boolean(isThinking) || isPending);
  const isListening =
    isConnected &&
    !isTutorSpeaking &&
    !isProcessing &&
    (isUserSpeaking ||
      micLevel > 5 ||
      (messages.length > 0 &&
        messages[messages.length - 1].role === 'user' &&
        messages[messages.length - 1].isInterim));

  // 2. Select avatar metadata
  const isIvan = persona === 'teacher-ivan';
  const tutorName = isIvan ? t.persona.teacherIvan.name : t.persona.emma.name;
  const voiceBadge = isIvan
    ? isEs
      ? 'Voz Masculina'
      : 'Puck (Male)'
    : isEs
    ? 'Voz Femenina'
    : 'Aoede (Female)';

  // 3. Extract the current phrase preview for the speech bubble
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.content && m.content.trim().length > 0);

  const previewPhrase = lastAssistantMessage?.content.trim() || '';

  return (
    <div
      id="tutor-avatar-stage"
      data-testid="tutor-avatar-stage"
      aria-label={t.avatarStage.avatarAria}
      className={`relative w-full rounded-2xl bg-[#091326] border border-[#A7C7E7]/30 p-3 sm:p-6 overflow-hidden flex flex-col items-center justify-center min-h-[144px] sm:min-h-[260px] md:min-h-[300px] shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Background Ambient Spotlight Effects */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isSpeaking
            ? 'opacity-100 bg-[radial-gradient(ellipse_at_center,_rgba(224,155,48,0.22)_0%,_transparent_70%)]'
            : isListening || isProcessing
            ? 'opacity-100 bg-[radial-gradient(ellipse_at_center,_rgba(167,199,231,0.22)_0%,_transparent_70%)]'
            : 'opacity-60 bg-[radial-gradient(ellipse_at_center,_rgba(26,49,83,0.6)_0%,_transparent_70%)]'
        }`}
      />

      {/* Top Status Bar Inside Stage */}
      <div className="w-full flex items-center justify-between z-20 mb-2 px-1 text-xs">
        {/* Tutor Identity Tag */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span className="font-montserrat font-bold uppercase tracking-[0.15em] text-[#FAFAFA] text-[11px] sm:text-xs whitespace-nowrap">
            {tutorName}
          </span>
          <span className="text-[10px] font-inter font-semibold text-[#E09B30] px-2 py-0.5 rounded bg-[#1A3153] border border-[#E09B30]/30 hidden sm:inline-block shrink-0">
            {voiceBadge}
          </span>
        </div>

        {/* Real-Time Live State Badge: Listening -> Thinking -> Speaking */}
        <div>
          {isSpeaking ? (
            <div
              id="avatar-state-speaking"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E09B30]/20 border border-[#E09B30] text-[#E09B30] font-montserrat font-bold text-[10px] sm:text-xs uppercase tracking-wider animate-pulse shadow-[0_0_12px_rgba(224,155,48,0.35)]"
            >
              <Volume2 size={13} className="animate-pulse" />
              <span>{isEs ? `${tutorName} hablando` : `${tutorName} speaking`}</span>
            </div>
          ) : isProcessing ? (
            <div
              id="avatar-state-thinking"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/60 text-[#E09B30] font-montserrat font-bold text-[10px] sm:text-xs uppercase tracking-wider"
            >
              <Loader2 size={13} className="animate-spin text-[#E09B30]" />
              <span>{isEs ? 'Procesando' : 'Thinking'}</span>
            </div>
          ) : isListening ? (
            <div
              id="avatar-state-listening"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#A7C7E7]/20 border border-[#A7C7E7] text-[#FAFAFA] font-montserrat font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(167,199,231,0.3)]"
            >
              <Mic size={13} className="text-[#A7C7E7] animate-pulse" />
              <span className="text-[#A7C7E7]">{isEs ? 'Escuchando' : 'Listening'}</span>
              <span
                className="inline-block h-2 rounded-full bg-[#E09B30] transition-all duration-75"
                style={{ width: `${Math.max(8, Math.min(36, Math.round(micLevel * 0.4)))}px` }}
              />
            </div>
          ) : (
            <div
              id="avatar-state-idle"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A3153]/80 border border-[#A7C7E7]/25 text-[#A7C7E7] font-montserrat font-semibold text-[10px] sm:text-xs uppercase tracking-wider"
            >
              <Radio size={12} className="text-[#10B981]" />
              <span>{isConnected ? (isEs ? 'Escuchando' : 'Listening') : t.avatarStage.startPrompt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Center Character Area with Concentric Audio Soundwave Rings */}
      <div className="relative flex items-center justify-center w-full py-4 sm:py-6">
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-[#A7C7E7]/60 ring-pulse-denim-1" />
            <div className="w-60 h-60 sm:w-72 sm:h-72 rounded-full border-2 border-[#A7C7E7]/40 ring-pulse-denim-2" />
          </div>
        )}

        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-[#E09B30]/75 ring-pulse-amber-1" />
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-[#E09B30]/50 ring-pulse-amber-2" />
            <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-[#E09B30]/25 ring-pulse-amber-3" />
          </div>
        )}

        {/* Live Speech Bubble Preview (During Speaking State) */}
        {isSpeaking && (
          <div
            id="tutor-speech-bubble"
            className="absolute -top-3 sm:-top-2 left-1/2 -translate-x-1/2 z-30 max-w-[90%] sm:max-w-md w-auto speech-bubble-pop pointer-events-none"
          >
            <div className="relative bg-[#FAFAFA] text-[#1A3153] px-4 py-2.5 rounded-xl border border-[#A7C7E7] shadow-xl text-xs sm:text-sm font-medium leading-relaxed">
              <div className="flex items-center gap-1.5 text-[10px] font-montserrat font-bold uppercase tracking-wider text-[#9A6515] mb-0.5">
                <Sparkles size={11} />
                <span>{tutorName}</span>
              </div>
              <p className="line-clamp-3 text-[#1A3153] font-inter">
                {previewPhrase || t.avatarStage.speaking}
              </p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#FAFAFA]" />
            </div>
          </div>
        )}

        {/* The 2D Rigged Chibi Avatar with Live Dynamic Audio Visemes */}
        <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 flex items-center justify-center transition-transform duration-300">
          <RiggedCharacter
            key={persona}
            persona={persona === 'emma' ? 'emma' : 'teacher-ivan'}
            state={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'}
            className="w-full h-full"
            alt={`${tutorName} Rigged Chibi Avatar`}
          />
        </div>

        {/* Pedestal Shadow & Under-Glow Floor */}
        <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-6 rounded-full bg-gradient-to-r from-transparent via-[#1A3153] to-transparent blur-md pointer-events-none opacity-80" />
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-36 sm:w-48 h-3 rounded-full blur-sm transition-colors duration-300 pointer-events-none ${
            isSpeaking
              ? 'bg-[#E09B30]/60'
              : isListening
              ? 'bg-[#A7C7E7]/50'
              : 'bg-[#A7C7E7]/20'
          }`}
        />
      </div>

      {/* Stage Bottom Subtitle / Guidance */}
      <div className="z-20 mt-1 text-center">
        <p className="text-[11px] sm:text-xs text-[#A7C7E7] font-inter">
          {isConnected
            ? isSpeaking
              ? isEs
                ? `${tutorName} hablando • Puedes interrumpir en cualquier momento`
                : `${tutorName} speaking • You can interrupt anytime`
              : isProcessing
              ? isEs
                ? 'Procesando tu respuesta...'
                : 'Thinking...'
              : isListening
              ? isEs
                ? 'Escuchando tu voz en tiempo real...'
                : 'Listening to your voice in real time...'
              : isEs
              ? 'Escuchando • Habla con naturalidad'
              : 'Listening • Speak naturally'
            : isIvan
            ? isEs
              ? 'Teacher Ivan • Mentor Pedagógico Empático y Estructurado'
              : 'Teacher Ivan • Empathetic & Structured Pedagogical Mentor'
            : isEs
            ? 'Emma • Coach Conversacional de Inglés Cercana y Dinámica'
            : 'Emma • Friendly Conversational English Coach'}
        </p>
      </div>
    </div>
  );
};

export default TutorAvatarStage;
