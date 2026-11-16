import React, { useState } from 'react';
import {
  Terminal,
  Activity,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Radio,
  Mic,
  Cpu,
} from 'lucide-react';
import { useDebugStore } from '../modules/debug/debugLogger';

export const LiveDebugPanel: React.FC = () => {
  const {
    debugEnabled,
    setDebugEnabled,
    logs,
    wsState,
    lastCloseCode,
    lastCloseReason,
    audioContextState,
    audioSampleRate,
    micPermission,
    clearLogs,
  } = useDebugStore();

  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default when DEBUG is off

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.category.toUpperCase()}] ${l.message}${l.details ? `\nDetails: ${l.details}` : ''}`)
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWsBadgeColor = () => {
    switch (wsState) {
      case 'OPEN':
        return '#34d399';
      case 'CONNECTING':
        return '#fbbf24';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="glass-panel" id="live-debug-panel" style={{ marginTop: 24 }}>
      {/* Header */}
      <div
        className="panel-header"
        style={{ cursor: 'pointer', marginBottom: isExpanded ? 14 : 0 }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Terminal size={18} color="#38bdf8" />
          <h2 className="panel-title" style={{ fontSize: '0.95rem', margin: 0 }}>
            Diagnostics &amp; Logs
          </h2>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 99,
              fontSize: '0.72rem',
              fontWeight: 700,
              background: `${getWsBadgeColor()}22`,
              border: `1px solid ${getWsBadgeColor()}55`,
              color: getWsBadgeColor(),
            }}
          >
            WS: {wsState}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Debug Mode Toggle (Off by default) */}
          <button
            id="toggle-debug-flag-btn"
            className="level-btn"
            style={{
              padding: '2px 8px',
              fontSize: '0.7rem',
              background: debugEnabled ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: debugEnabled ? 'rgba(52, 211, 153, 0.4)' : 'var(--border-subtle)',
              color: debugEnabled ? '#34d399' : 'var(--text-muted)',
              fontWeight: 600,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setDebugEnabled(!debugEnabled);
              if (!debugEnabled) setIsExpanded(true);
            }}
            title={debugEnabled ? 'Verbose Debug Logging Active (Console & Transcripts)' : 'Debug Logging is OFF (Click to enable)'}
          >
            DEBUG: {debugEnabled ? 'ON' : 'OFF'}
          </button>

          <div onClick={() => setIsExpanded(!isExpanded)} style={{ display: 'flex', alignItems: 'center' }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Status Metric Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 8,
              marginBottom: 12,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>WebSocket:</span>
              <strong style={{ color: getWsBadgeColor() }}>{wsState}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Close Code / Reason:</span>
              <span style={{ color: lastCloseCode ? '#f87171' : 'var(--text-muted)' }}>
                {lastCloseCode !== null ? `${lastCloseCode} (${lastCloseReason || 'None'})` : 'N/A'}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>AudioContext:</span>
              <span>
                {audioContextState} {audioSampleRate ? `(${audioSampleRate}Hz)` : ''}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Microphone Permission:</span>
              <span
                style={{
                  color:
                    micPermission === 'granted'
                      ? '#34d399'
                      : micPermission === 'denied'
                      ? '#f87171'
                      : '#fbbf24',
                }}
              >
                {micPermission}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Events Captured: {logs.length} (Tokens redacted)
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="level-btn"
                style={{ padding: '3px 9px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={handleCopyLogs}
                title="Copy all logs to clipboard"
              >
                {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy Logs'}</span>
              </button>
              <button
                className="level-btn"
                style={{ padding: '3px 9px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={clearLogs}
                title="Clear debug log list"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Log Stream */}
          <div
            id="debug-log-stream"
            style={{
              maxHeight: 220,
              overflowY: 'auto',
              background: '#040711',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              padding: '10px 12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.74rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '16px 0' }}>
                No events recorded yet. Click "Start Practice Session" to view WebSocket handshake logs.
              </div>
            ) : (
              logs.map((entry) => {
                let badgeColor = '#94a3b8';
                if (entry.level === 'error') badgeColor = '#f87171';
                else if (entry.level === 'warn') badgeColor = '#fbbf24';
                else if (entry.level === 'success') badgeColor = '#34d399';
                else if (entry.category === 'websocket') badgeColor = '#38bdf8';
                else if (entry.category === 'setup') badgeColor = '#a855f7';
                else if (entry.category === 'audio') badgeColor = '#818cf8';

                return (
                  <div
                    key={entry.id}
                    style={{
                      borderLeft: `2px solid ${badgeColor}`,
                      paddingLeft: 8,
                      lineHeight: 1.45,
                      color: entry.level === 'error' ? '#fca5a5' : '#cbd5e1',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.7rem' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{entry.timestamp}</span>
                      <span
                        style={{
                          color: badgeColor,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.66rem',
                        }}
                      >
                        [{entry.category}]
                      </span>
                    </div>
                    <div>{entry.message}</div>
                    {entry.details && (
                      <pre
                        style={{
                          marginTop: 4,
                          padding: 6,
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 4,
                          color: '#93c5fd',
                          overflowX: 'auto',
                          fontSize: '0.7rem',
                        }}
                      >
                        {entry.details}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
