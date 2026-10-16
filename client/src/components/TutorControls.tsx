import React, { useEffect, useState } from 'react';
import {
  Play,
  Square,
  Loader2,
  AlertCircle,
  Clock,
  Cpu,
  Radio,
  Mic,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useDebugStore } from '../modules/debug/debugLogger';
import { useTranslation } from '../modules/i18n/languageStore';

export const TutorControls: React.FC = () => {
  const lastCloseCode = useDebugStore((s) => s.lastCloseCode);
  const lastCloseReason = useDebugStore((s) => s.lastCloseReason);
  const {
    status,
    tokenInfo,
    errorMessage,
    sessionStartTime,
    micLevel,
    isTutorSpeaking,
    startSession,
    stopSession,
    clearError,
  } = useConversationStore();

  const { t } = useTranslation();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer counter when session is active
  useEffect(() => {
    let interval: number | undefined;
    if (status === 'connected' && sessionStartTime) {
      interval = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [status, sessionStartTime]);

  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isConnected = status === 'connected';
  const isRequesting = status === 'requesting_token';
  const isConnecting = status === 'connecting';
  const isPending = isRequesting || isConnecting;

  return (
    <div className="glass-panel hero-controls-panel" id="tutor-controls-panel">
      <h1 className="session-h1">{t.tutorConsole.sessionH1}</h1>
      <p className="session-tagline">
        {t.tutorConsole.sessionTagline}
      </p>

      <div className="button-stage">
        {isConnected && <div className="pulse-ring active" />}

        {!isConnected ? (
          <button
            id="start-session-btn"
            className="btn-session btn-start"
            disabled={isPending}
            onClick={() => startSession()}
          >
            {isRequesting ? (
              <>
                <Loader2 className="spinner" size={20} />
                <span>{t.tutorConsole.mintingToken}</span>
              </>
            ) : isConnecting ? (
              <>
                <Loader2 className="spinner" size={20} />
                <span>{t.tutorConsole.connectingLive}</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>{t.tutorConsole.startBtn}</span>
              </>
            )}
          </button>
        ) : (
          <button
            id="stop-session-btn"
            className="btn-session btn-stop"
            onClick={() => stopSession()}
          >
            <Square size={20} fill="currentColor" />
            <span>{t.tutorConsole.stopBtn}</span>
          </button>
        )}
      </div>

      {/* Metrics Bar */}
      <div className="session-metrics" id="session-metrics-bar">
        <div className="metric-item">
          <Clock size={15} />
          <span>{t.tutorConsole.duration}</span>
          <span className="metric-value">{formatTimer(elapsedSeconds)}</span>
        </div>

        <div className="hidden sm:block" style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

        <div className="metric-item">
          <Cpu size={15} />
          <span>{t.tutorConsole.model}</span>
          <span className="metric-value truncate max-w-[140px] sm:max-w-none" title={tokenInfo?.model || 'gemini-2.5-flash-native-audio-latest'}>
            {tokenInfo?.model || 'gemini-2.5-flash-native-audio-latest'}
          </span>
        </div>

        <div className="hidden sm:block" style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

        <div className="metric-item">
          <Radio size={15} color={isConnected ? '#34d399' : '#94a3b8'} />
          <span>{t.tutorConsole.audio}</span>
          <span className="metric-value" style={{ color: isConnected ? '#34d399' : '#94a3b8' }}>
            {isConnected ? '16k In / 24k Out' : t.tutorConsole.ready}
          </span>
        </div>
      </div>

      {/* Audio Status Banner */}
      {isConnected ? (
        <div className="audio-live-banner" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className={`status-indicator-dot ${micLevel > 5 ? 'active-pulse' : ''}`} />
            <Mic size={16} color="#818cf8" />
            <span>
              {t.tutorConsole.micStream} <strong>{micLevel > 5 ? t.tutorConsole.micDetecting : t.tutorConsole.micListening}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Volume2 size={16} color={isTutorSpeaking ? '#34d399' : '#94a3b8'} />
            <span>
              {t.tutorConsole.tutorVoice} <strong>{isTutorSpeaking ? t.tutorConsole.tutorSpeaking : t.tutorConsole.tutorIdle}</strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="audio-phase-notice" style={{ marginTop: 20 }}>
          <Radio size={16} color="#38bdf8" />
          <span>
            {t.tutorConsole.streamingNotice}
          </span>
        </div>
      )}

      {/* Error Banner with Close Code & Retry Action */}
      {errorMessage && (
        <div className="error-banner" id="session-error-banner" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2, color: '#f87171' }} />
            <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.45 }}>
              <div>
                <strong style={{ color: '#fca5a5' }}>{t.tutorConsole.connectionError}</strong> {errorMessage}
              </div>
              {lastCloseCode !== null && (
                <div style={{ marginTop: 4, fontSize: '0.76rem', color: '#fecaca', opacity: 0.9 }}>
                  {t.tutorConsole.wsCode} <code>{lastCloseCode}</code> {lastCloseReason ? `— Reason: ${lastCloseReason}` : ''}
                </div>
              )}
            </div>
            <button onClick={clearError} title="Dismiss" style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 4 }}>
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid rgba(248, 113, 113, 0.2)', paddingTop: 8 }}>
            <button
              id="retry-connection-btn"
              className="level-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                fontSize: '0.8rem',
                background: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#fff',
                fontWeight: 600,
              }}
              onClick={() => {
                clearError();
                startSession();
              }}
            >
              <RotateCcw size={14} />
              <span>{t.tutorConsole.retryBtn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorControls;
