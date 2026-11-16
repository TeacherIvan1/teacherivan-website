import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Send,
  Trash2,
  Sparkles,
  Radio,
  User,
  Bot,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';

export const ChatTranscript: React.FC = () => {
  const {
    status,
    messages,
    micLevel,
    isTutorSpeaking,
    isMuted,
    toggleMute,
    clearMessages,
    sendUserTextMessage,
    forceTurnComplete,
  } = useConversationStore();

  const { t } = useTranslation();
  const persona = useTeachingStore((s) => s.persona);
  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isConnected = status === 'connected';
  const isIvan = persona === 'teacher-ivan';
  const tutorName = isIvan ? t.persona.teacherIvan.name : t.persona.emma.name;

  // Auto-scroll to the latest message as new transcription chunks arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTutorSpeaking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected) return;
    sendUserTextMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="glass-panel chat-transcript-panel" id="chat-transcript-panel">
      {/* Panel Header */}
      <div className="panel-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="transcript-header-icon">
            <Radio size={18} color="#818cf8" />
          </div>
          <div>
            <h2 className="panel-title" style={{ fontSize: '1.05rem', margin: 0 }}>
              {t.transcript.title}
            </h2>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{t.transcript.subtitle}</span>
              {isConnected && (
                <span className="live-pill">
                  <span className="live-dot" /> {t.transcript.live}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Audio Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isConnected && (
            <>
              {/* Mic Level Meter */}
              <div
                className="mic-level-badge"
                title={`${t.transcript.micLevel} ${micLevel}%`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 99,
                  background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  border: isMuted
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                {isMuted ? (
                  <MicOff size={13} color="#f87171" />
                ) : (
                  <Mic size={13} color="#818cf8" />
                )}
                <div className="mic-bars">
                  <span
                    className="mic-bar"
                    style={{ height: `${Math.max(4, Math.min(14, (micLevel / 100) * 14))}px` }}
                  />
                  <span
                    className="mic-bar"
                    style={{ height: `${Math.max(4, Math.min(14, (micLevel / 80) * 14))}px` }}
                  />
                  <span
                    className="mic-bar"
                    style={{ height: `${Math.max(4, Math.min(14, (micLevel / 60) * 14))}px` }}
                  />
                </div>
              </div>

              {/* Tutor Speaking Indicator */}
              {isTutorSpeaking && (
                <div
                  className="tutor-speaking-badge"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 9px',
                    borderRadius: 99,
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    fontSize: '0.74rem',
                    color: '#34d399',
                  }}
                >
                  <Volume2 size={13} />
                  <span>{isIvan ? `${tutorName} Speaking` : t.transcript.emmaSpeaking}</span>
                  <div className="wave-animation">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {/* Mute Toggle */}
              <button
                className={`icon-btn ${isMuted ? 'muted' : ''}`}
                onClick={toggleMute}
                title={isMuted ? t.transcript.unmute : t.transcript.mute}
              >
                {isMuted ? <MicOff size={15} color="#f87171" /> : <Mic size={15} />}
              </button>
            </>
          )}

          {/* Clear Messages */}
          {messages.length > 0 && (
            <button
              className="icon-btn"
              onClick={clearMessages}
              title={t.transcript.clear}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Student-Friendly Reassurance Banner */}
      <div
        id="transcript-reassurance-banner"
        className="px-3 py-1.5 mb-3 rounded-xl bg-[#1A3153]/60 border border-[#A7C7E7]/30 flex items-center gap-2 text-[11px] text-[#A7C7E7]"
      >
        <Sparkles size={13} className="text-[#E09B30] flex-shrink-0" />
        <span>{t.transcript.reassuranceNotice}</span>
      </div>

      {/* Messages Stream */}
      <div className="chat-messages-scroll" ref={scrollRef} id="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="empty-icon-wrap">
              <Sparkles size={28} color="#818cf8" />
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.98rem', color: '#e2e8f0', marginBottom: 4 }}>
              {t.transcript.emptyTitle}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
              {t.transcript.emptyDesc}
            </p>
          </div>
        ) : (
          messages.map((item) => {
            if (item.role === 'system') {
              return (
                <div key={item.id} className="transcript-system-msg">
                  <Terminal size={13} style={{ flexShrink: 0, opacity: 0.8 }} />
                  <span>{item.content}</span>
                  <span className="system-time">{item.timestamp}</span>
                </div>
              );
            }

            const isUser = item.role === 'user';
            const isUserSpeakingInterim = isUser && item.isInterim;

            return (
              <div
                key={item.id}
                className={`transcript-bubble-row ${isUser ? 'user-row' : 'assistant-row'}`}
              >
                <div className={`avatar-badge ${isUser ? 'user-avatar' : 'tutor-avatar'}`}>
                  {isUser ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div
                  className={`transcript-bubble ${
                    isUser ? 'user-bubble' : 'assistant-bubble'
                  } ${isUserSpeakingInterim ? 'live-speaking-bubble' : ''} ${
                    item.isInterrupted ? 'interrupted-bubble' : ''
                  }`}
                >
                  <div className="bubble-header">
                    <span className={`bubble-author ${item.isInterrupted ? 'interrupted-author' : ''}`}>
                      {isUser ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{t.transcript.you}</span>
                          {isUserSpeakingInterim && (
                            <>
                              <span className="live-speaking-pill">
                                <span className="live-speaking-dot" />
                                {t.transcript.speaking}
                              </span>
                              <button
                                type="button"
                                id="done-speaking-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  forceTurnComplete();
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#E09B30]/90 transition-all shadow-sm cursor-pointer border-none"
                                title="Click to force AI tutor to reply immediately"
                              >
                                <CheckCircle2 size={11} />
                                <span>{t.transcript.doneSpeaking}</span>
                              </button>
                            </>
                          )}
                        </div>
                      ) : item.isInterrupted ? (
                        isIvan ? `${tutorName} (interrupted)` : t.transcript.interruptedTutor
                      ) : (
                        isIvan ? `${tutorName} (Tutor)` : t.transcript.tutor
                      )}
                    </span>
                    <span className="bubble-time">{item.timestamp}</span>
                  </div>

                  <div className="bubble-content">
                    {item.content}
                    {item.isInterrupted && (
                      <span className="interrupted-pill" title="Tutor speech cut off by learner barge-in">
                        {t.transcript.interruptedPill}
                      </span>
                    )}
                    {item.isInterim && !item.isInterrupted && <span className="typing-cursor" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Text/Voice Input Bar */}
      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          id="chat-message-input"
          placeholder={
            isConnected
              ? (isIvan
                  ? (t.transcript.placeholderConnectedIvan || `Speak into microphone or type a message to ${tutorName}...`)
                  : (t.transcript.placeholderConnectedEmma || `Speak into microphone or type a message to ${tutorName}...`))
              : t.transcript.placeholderDisconnected
          }
          value={inputMessage}
          disabled={!isConnected}
          onChange={(e) => setInputMessage(e.target.value)}
          className="chat-text-input"
        />
        <button
          type="submit"
          id="send-message-btn"
          disabled={!isConnected || !inputMessage.trim()}
          className="chat-send-btn"
          title={t.transcript.sendTurn}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

export default ChatTranscript;
