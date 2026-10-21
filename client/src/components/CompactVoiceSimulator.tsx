import React, { useState, useEffect } from 'react';
import {
  Mic,
  Volume2,
  Square,
  CheckCircle2,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Radio,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { TutorAvatarStage } from './TutorAvatarStage';
import { ChatTranscript } from './ChatTranscript';
import { LearnerLevel } from '../modules/teaching/types';

export const CompactVoiceSimulator: React.FC = () => {
  const { t } = useTranslation();
  const {
    status,
    messages,
    micLevel,
    isTutorSpeaking,
    isUserSpeaking,
    sessionStartTime,
    isReconnecting,
    errorMessage,
    startSession,
    stopSession,
    forceTurnComplete,
    clearError,
  } = useConversationStore();

  const {
    persona,
    level,
    selectedScenarioId,
    availableScenarios,
    isLocked,
    setPersona,
    setLevel,
    selectScenario,
  } = useTeachingStore();

  const [showVocabTips, setShowVocabTips] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Active scenario metadata
  const activeScenario =
    availableScenarios.find((s) => s.id === selectedScenarioId) || availableScenarios[0];

  const isConnected = status === 'connected';
  const isRequesting = status === 'requesting_token';
  const isConnecting = status === 'connecting';
  const isPending = isRequesting || isConnecting;

  // Session timer
  useEffect(() => {
    let interval: number | undefined;
    if (isConnected && sessionStartTime) {
      interval = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isConnected, sessionStartTime]);

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Level selector mapping: [Diagnostic | A1 | A2 | B1 | B2 | IELTS]
  type LevelPillId = 'diag' | 'a1' | 'a2' | 'b1' | 'b2' | 'ielts';
  const levelPills: { id: LevelPillId; label: string; cefr: string }[] = [
    { id: 'diag', label: t.compactSimulator.diagnosticPill, cefr: 'Diag' },
    { id: 'a1', label: 'A1', cefr: 'Beginner' },
    { id: 'a2', label: 'A2', cefr: 'Elem' },
    { id: 'b1', label: 'B1', cefr: 'Inter' },
    { id: 'b2', label: 'B2', cefr: 'Upper' },
    { id: 'ielts', label: 'IELTS', cefr: 'Adv' },
  ];

  const handleLevelPillClick = (pillId: LevelPillId) => {
    if (isLocked) return;
    if (pillId === 'diag') {
      selectScenario('diagnostic-placement');
    } else if (pillId === 'a1' || pillId === 'a2') {
      setLevel('beginner');
      if (selectedScenarioId === 'diagnostic-placement') {
        selectScenario('casual-coffee');
      }
    } else if (pillId === 'b1' || pillId === 'b2') {
      setLevel('intermediate');
      if (selectedScenarioId === 'diagnostic-placement') {
        selectScenario('job-interview');
      }
    } else if (pillId === 'ielts') {
      setLevel('advanced');
      if (selectedScenarioId === 'diagnostic-placement') {
        selectScenario('scholarship-interview');
      }
    }
  };

  // Determine active level pill
  const isPillActive = (pillId: LevelPillId): boolean => {
    if (selectedScenarioId === 'diagnostic-placement') {
      return pillId === 'diag';
    }
    if (pillId === 'a1' || pillId === 'a2') return level === 'beginner';
    if (pillId === 'b1' || pillId === 'b2') return level === 'intermediate';
    if (pillId === 'ielts') return level === 'advanced';
    return false;
  };

  // Extract latest user and tutor message for live docked captions
  const latestTutorMsg = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.content && m.content.trim().length > 0);

  const latestUserMsg = [...messages]
    .reverse()
    .find((m) => m.role === 'user' && m.content && m.content.trim().length > 0);

  return (
    <div
      id="compact-voice-simulator"
      className="w-full max-w-4xl mx-auto flex flex-col gap-4 py-4 px-3 sm:px-6"
    >
      {/* 1. Header & Live Indicator */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#A7C7E7]/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-[10px] font-montserrat font-bold uppercase tracking-wider mb-1">
            <Radio size={11} className="text-[#10b981] animate-pulse" />
            <span>Google Gemini Live Native Voice</span>
          </div>
          <h1 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#FAFAFA] tracking-tight">
            {t.compactSimulator.title}
          </h1>
        </div>

        {/* Timer, Reconnecting Pill or Status */}
        <div className="flex items-center gap-2">
          {isReconnecting && (
            <div
              id="reconnecting-audio-pill"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E09B30] text-[#1A3153] text-xs font-montserrat font-bold uppercase tracking-wider animate-pulse shadow-md"
            >
              <Loader2 size={13} className="animate-spin text-[#1A3153]" />
              <span>{t.authModal.reconnecting}</span>
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12223a] border border-[#10b981]/50 text-xs text-[#10b981] font-mono font-bold shadow-sm">
              <Clock size={13} className="text-[#10b981]" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#A7C7E7]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>24/7 Available</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Compact Control Bar (Tutor Persona + Level Selector + Scenario Strip) */}
      <div className="bg-[#12223a]/90 backdrop-blur-md rounded-2xl border border-[#A7C7E7]/25 p-3 sm:p-4 flex flex-col gap-3 shadow-md">
        {/* Row A: Tutor Persona Pill & Level Pill Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tutor Persona Toggle: [👨‍🏫 Ivan | 👩‍🏫 Emma] */}
          <div className="flex items-center gap-1 bg-[#1A3153] p-1 rounded-xl border border-[#A7C7E7]/30">
            <button
              type="button"
              id="tutor-persona-ivan-btn"
              disabled={isLocked}
              onClick={() => setPersona('teacher-ivan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                persona === 'teacher-ivan'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              <span>👨‍🏫</span>
              <span>{t.persona.teacherIvan.name}</span>
            </button>
            <button
              type="button"
              id="tutor-persona-emma-btn"
              disabled={isLocked}
              onClick={() => setPersona('emma')}
              className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                persona === 'emma'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              <span>👩‍🏫</span>
              <span>{t.persona.emma.name}</span>
            </button>
          </div>

          {/* Level Pill Selector: [Diagnostic | A1 | A2 | B1 | B2 | IELTS] */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {levelPills.map((pill) => {
              const active = isPillActive(pill.id);
              return (
                <button
                  key={pill.id}
                  type="button"
                  id={`level-pill-${pill.id}`}
                  disabled={isLocked}
                  onClick={() => handleLevelPillClick(pill.id)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-montserrat font-bold transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#FAFAFA] text-[#1A3153] shadow-sm scale-105'
                      : 'bg-[#1A3153]/70 text-[#A7C7E7] hover:bg-[#1A3153] hover:text-[#FAFAFA] border border-[#A7C7E7]/20'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row B: Scenario Selector + Collapsible Vocab & Tips Toggle */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#A7C7E7]/15">
          {/* Scenario Dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[11px] font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] shrink-0 hidden xs:inline">
              {t.compactSimulator.scenarioLabel}:
            </span>
            <select
              id="compact-scenario-select"
              disabled={isLocked}
              value={selectedScenarioId}
              onChange={(e) => selectScenario(e.target.value)}
              className="bg-[#1A3153] text-[#FAFAFA] text-xs font-inter font-medium rounded-xl border border-[#A7C7E7]/30 px-3 py-1.5 w-full max-w-sm truncate focus:outline-none focus:border-[#E09B30] cursor-pointer"
            >
              {availableScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id} className="bg-[#12223a] text-[#FAFAFA]">
                  {scenario.title} ({scenario.category})
                </option>
              ))}
            </select>
          </div>

          {/* Collapsible "ℹ️ Vocab & Tips" Button */}
          <button
            type="button"
            id="toggle-vocab-tips-btn"
            onClick={() => setShowVocabTips((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-montserrat font-semibold transition-all shrink-0 cursor-pointer ${
              showVocabTips
                ? 'bg-[#E09B30] text-[#1A3153]'
                : 'bg-[#1A3153] text-[#E09B30] border border-[#E09B30]/30 hover:border-[#E09B30]'
            }`}
          >
            <Info size={13} />
            <span className="hidden sm:inline">{t.compactSimulator.vocabTipsBtn}</span>
            {showVocabTips ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Collapsible Popover: Vocab & Tips */}
        {showVocabTips && (
          <div
            id="vocab-tips-popover"
            className="p-3.5 rounded-xl bg-[#1A3153]/90 border border-[#E09B30]/40 text-xs animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-montserrat font-bold text-[#E09B30] flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Target Focus: {activeScenario.title}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowVocabTips(false)}
                className="text-[#A7C7E7] hover:text-[#FAFAFA]"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[#A7C7E7] text-[11px] mb-2 leading-relaxed">
              {activeScenario.description}
            </p>
            {activeScenario.targetVocabulary && activeScenario.targetVocabulary.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-bold text-[#FAFAFA] block mb-1">
                  Vocabulary:
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeScenario.targetVocabulary.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#12223a] text-[#E09B30] border border-[#E09B30]/30 text-[10px] font-mono"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {activeScenario.targetGrammar && activeScenario.targetGrammar.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-[#FAFAFA] block mb-1">
                  Grammar / Connectors:
                </span>
                <p className="text-[11px] text-[#A7C7E7]">
                  {activeScenario.targetGrammar.join(' • ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Centered 2D Avatar Stage (Compact: h-48 mobile / h-64 desktop) */}
      <div className="relative w-full overflow-hidden rounded-2xl">
        <TutorAvatarStage className="min-h-[220px] sm:min-h-[260px] md:min-h-[290px] py-2 sm:py-4" />
      </div>

      {/* 4. Live Docked Caption Overlay (Latest Tutor & User Utterance) */}
      <div
        id="compact-live-captions-dock"
        className="rounded-2xl bg-[#12223a]/80 backdrop-blur-sm border border-[#A7C7E7]/25 p-3 sm:p-4 flex flex-col gap-2 shadow-sm"
      >
        {/* Tutor Latest Bubble */}
        <div className="flex items-start gap-2.5 text-xs sm:text-sm">
          <div className="w-6 h-6 rounded-full bg-[#E09B30] text-[#1A3153] flex items-center justify-center shrink-0 font-bold text-[11px]">
            {persona === 'teacher-ivan' ? 'I' : 'E'}
          </div>
          <div className="flex-1 bg-[#1A3153]/80 rounded-xl rounded-tl-none p-2.5 border border-[#E09B30]/30">
            <div className="flex items-center justify-between text-[10px] font-montserrat font-bold text-[#E09B30] mb-0.5">
              <span>{persona === 'teacher-ivan' ? t.persona.teacherIvan.name : t.persona.emma.name}</span>
              {isTutorSpeaking && (
                <span className="inline-flex items-center gap-1 text-[#10b981] animate-pulse">
                  <Volume2 size={11} />
                  <span>Speaking...</span>
                </span>
              )}
            </div>
            <p className="text-[#FAFAFA] font-inter leading-relaxed">
              {latestTutorMsg?.content || (
                <span className="text-[#A7C7E7]/70 italic">
                  {isConnected
                    ? t.avatarStage.speaking
                    : t.compactSimulator.idleHint}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* User Latest Bubble (if exists) */}
        {latestUserMsg && (
          <div className="flex items-start gap-2.5 text-xs sm:text-sm flex-row-reverse">
            <div className="w-6 h-6 rounded-full bg-[#A7C7E7] text-[#1A3153] flex items-center justify-center shrink-0 font-bold text-[11px]">
              👤
            </div>
            <div className="flex-1 bg-[#1A3153]/50 rounded-xl rounded-tr-none p-2.5 border border-[#A7C7E7]/20 text-right">
              <div className="text-[10px] font-montserrat font-bold text-[#A7C7E7] mb-0.5">
                You
              </div>
              <p className="text-[#FAFAFA] font-inter leading-relaxed">
                {latestUserMsg.content}
              </p>
            </div>
          </div>
        )}

        {/* Full Transcript Drawer Toggle Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            id="toggle-chat-transcript-btn"
            onClick={() => setShowTranscriptDrawer((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            <MessageSquare size={13} className="text-[#E09B30]" />
            <span>{t.compactSimulator.chatTranscriptBtn}</span>
            {showTranscriptDrawer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Collapsible Full Transcript Drawer */}
      {showTranscriptDrawer && (
        <div className="w-full animate-in fade-in duration-200">
          <ChatTranscript />
        </div>
      )}

      {/* 5. Simple, Intuitive 1-Tap Action Dock */}
      <div
        id="compact-action-dock"
        className="w-full rounded-2xl bg-[#12223a] border-2 border-[#E09B30]/40 p-4 shadow-xl flex flex-col items-center gap-3"
      >
        {!isConnected ? (
          /* IDLE STATE: 1 Large #E09B30 Pill Button */
          <div className="w-full flex flex-col items-center gap-2">
            <button
              id="start-session-btn"
              type="button"
              disabled={isPending}
              onClick={() => startSession()}
              className="w-full max-w-md py-4 px-6 rounded-full font-montserrat font-bold text-sm sm:text-base uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-lg shadow-[#E09B30]/30 flex items-center justify-center gap-3 cursor-pointer min-h-[54px]"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{t.tutorConsole.mintingToken}</span>
                </>
              ) : isConnecting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{t.tutorConsole.connectingLive}</span>
                </>
              ) : (
                <>
                  <Mic size={22} className="text-[#1A3153]" />
                  <span>{t.compactSimulator.startSpeaking}</span>
                </>
              )}
            </button>
            <p className="text-xs text-[#A7C7E7]/80 text-center font-medium">
              {t.compactSimulator.idleHint}
            </p>
          </div>
        ) : (
          /* ACTIVE STATE: Large Green/Amber "Done Speaking" + Compact Red "End & Score" */
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Primary Action: Done Speaking (Forces instant reply) */}
            <button
              id="done-speaking-btn"
              type="button"
              onClick={() => forceTurnComplete()}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-full font-montserrat font-bold text-sm uppercase tracking-wider bg-[#10b981] hover:bg-[#059669] text-[#FAFAFA] transition-all duration-200 shadow-lg shadow-[#10b981]/25 flex items-center justify-center gap-2 cursor-pointer min-h-[50px] animate-pulse-glow-amber"
            >
              <CheckCircle2 size={18} />
              <span>{t.compactSimulator.doneSpeaking}</span>
            </button>

            {/* Compact Red: End & Score */}
            <button
              id="stop-session-btn"
              type="button"
              onClick={() => stopSession()}
              className="w-full sm:w-auto py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#f43f5e]/20 hover:bg-[#f43f5e] text-[#f87171] hover:text-[#FAFAFA] border border-[#f43f5e]/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer min-h-[50px]"
            >
              <Square size={16} fill="currentColor" />
              <span>{t.compactSimulator.endAndScore}</span>
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div
            id="compact-simulator-error"
            className="w-full p-3 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/40 flex items-center justify-between gap-2 text-xs text-[#fca5a5]"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-[#f87171] shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-[#FAFAFA] hover:underline font-bold text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactVoiceSimulator;
