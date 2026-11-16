import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';

export const TokenInspector: React.FC = () => {
  const tokenInfo = useConversationStore((s) => s.tokenInfo);
  const status = useConversationStore((s) => s.status);
  const [showFullToken, setShowFullToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (tokenInfo?.token) {
      navigator.clipboard.writeText(tokenInfo.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTokenDisplay = (rawToken: string): string => {
    if (showFullToken) return rawToken;
    if (rawToken.length <= 24) return rawToken;
    return `${rawToken.substring(0, 16)}••••••••••••••••${rawToken.substring(rawToken.length - 8)}`;
  };

  return (
    <div className="glass-panel" id="token-inspector-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <KeyRound size={20} color="#38bdf8" />
          Ephemeral Token Inspector
        </h2>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Live API Security</span>
      </div>

      <div className="security-badge-banner">
        <ShieldCheck size={28} style={{ flexShrink: 0 }} />
        <div>
          <strong>Server-Minted Ephemeral Token:</strong> Master <code>GEMINI_API_KEY</code> is
          isolated on the Express backend. The client only receives this scoped, short-lived token.
        </div>
      </div>

      {tokenInfo ? (
        <div className="token-card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Token String:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="level-btn"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                onClick={() => setShowFullToken(!showFullToken)}
                title={showFullToken ? 'Hide token' : 'Show full token'}
              >
                {showFullToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                className="level-btn"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                onClick={handleCopy}
                title="Copy token to clipboard"
              >
                {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="token-preview-box" id="token-value-display">
            {formatTokenDisplay(tokenInfo.token)}
          </div>

          <div className="info-row">
            <span className="info-label">Single-Use Constraint:</span>
            <span className="info-val" style={{ color: '#34d399' }}>1 Connection (Strict)</span>
          </div>

          <div className="info-row">
            <span className="info-label">Minted At:</span>
            <span className="info-val">{new Date(tokenInfo.mintedAt).toLocaleTimeString()}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Session Connect Window:</span>
            <span className="info-val" style={{ color: '#fbbf24' }}>
              {new Date(tokenInfo.newSessionExpireTime).toLocaleTimeString()}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Max Token Lifetime:</span>
            <span className="info-val">{new Date(tokenInfo.expireTime).toLocaleTimeString()}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Target Model Scope:</span>
            <span className="info-val">{tokenInfo.model}</span>
          </div>
        </div>
      ) : (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
          {status === 'requesting_token' ? (
            'Requesting ephemeral token from Express backend...'
          ) : (
            'No active token. Click "Start Practice Session" to mint a new token from the server.'
          )}
        </div>
      )}
    </div>
  );
};
