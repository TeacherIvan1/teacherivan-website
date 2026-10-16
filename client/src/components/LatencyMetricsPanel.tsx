import React from 'react';
import { Gauge, Zap, Clock, Play } from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';

export const LatencyMetricsPanel: React.FC = () => {
  const latencyStats = useConversationStore((s) => s.latencyStats);

  const formatMs = (val: number | null): string => {
    if (val === null || val === undefined) return '—';
    return `${val} ms`;
  };

  return (
    <div className="glass-panel" id="latency-metrics-panel" style={{ padding: '16px 20px' }}>
      <div className="panel-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={18} color="#f59e0b" />
          <h2 className="panel-title" style={{ fontSize: '0.98rem', margin: 0 }}>
            Real-Time Turn Latency
          </h2>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          {latencyStats.totalTurnsMeasured} {latencyStats.totalTurnsMeasured === 1 ? 'turn' : 'turns'} measured
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: 14 }}>
        Measured from <strong>End of Speech (EOS)</strong> (server input transcription) to first audio chunk received over WebSocket and scheduled playback.
      </p>

      {/* Grid of 3 metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        {/* Metric 1: Last Turn */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
            Last Turn
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6' }}>
            <span style={{ color: '#38bdf8' }}>RX:</span> {formatMs(latencyStats.lastTurnReceivedMs)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
            <span style={{ color: '#34d399' }}>Play:</span> {formatMs(latencyStats.lastTurnPlayedMs)}
          </div>
        </div>

        {/* Metric 2: Median (P50) */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
            Median (P50)
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6' }}>
            <span style={{ color: '#38bdf8' }}>RX:</span> {formatMs(latencyStats.medianReceivedMs)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
            <span style={{ color: '#34d399' }}>Play:</span> {formatMs(latencyStats.medianPlayedMs)}
          </div>
        </div>

        {/* Metric 3: P95 */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
            P95 (95th %)
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6' }}>
            <span style={{ color: '#38bdf8' }}>RX:</span> {formatMs(latencyStats.p95ReceivedMs)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
            <span style={{ color: '#34d399' }}>Play:</span> {formatMs(latencyStats.p95PlayedMs)}
          </div>
        </div>
      </div>
    </div>
  );
};
