import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle,
  Lock,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { useTeachingStore, buildSystemInstruction } from '../modules/teaching/teachingStore';
import { LearnerLevel, CorrectionMode } from '../modules/teaching/types';

export const TeachingCard: React.FC = () => {
  const {
    level,
    correctionMode,
    selectedScenarioId,
    availableScenarios,
    activeInstruction,
    isLocked,
    setLevel,
    setCorrectionMode,
    selectScenario,
    getSettings,
  } = useTeachingStore();

  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeScenario =
    availableScenarios.find((s) => s.id === selectedScenarioId) || availableScenarios[0];

  const levels: { id: LearnerLevel; label: string; sub: string }[] = [
    { id: 'beginner', label: 'Beginner', sub: 'A1–A2' },
    { id: 'intermediate', label: 'Intermediate', sub: 'B1–B2' },
    { id: 'advanced', label: 'Advanced', sub: 'C1–C2' },
  ];

  const correctionModes: { id: CorrectionMode; label: string; desc: string }[] = [
    {
      id: 'conversation',
      label: 'Conversation Mode',
      desc: 'Flow & immersion • No explicit corrections • Gentle modeling only',
    },
    {
      id: 'coaching',
      label: 'Coaching Mode',
      desc: 'Targeted recasts • 1 fix per turn • Prioritizes grammar focus',
    },
  ];

  // The instruction currently in effect: locked active instruction, or preview of next session
  const currentInstruction = isLocked && activeInstruction
    ? activeInstruction
    : buildSystemInstruction(getSettings());

  const handleCopyInstruction = () => {
    navigator.clipboard.writeText(currentInstruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel" id="teaching-context-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={20} color="#E09B30" />
          <h2 className="panel-title" style={{ margin: 0 }}>
            Tutor Pedagogical Config
          </h2>
        </div>
        {isLocked ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 8px',
              borderRadius: 99,
              fontSize: '0.72rem',
              fontWeight: 600,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
            }}
            title="Settings are locked while a practice session is active"
          >
            <Lock size={12} />
            Session Locked
          </span>
        ) : (
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Live Session Directives
          </span>
        )}
      </div>

      {isLocked && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            marginBottom: 14,
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: '#fde68a',
          }}
        >
          <Lock size={13} style={{ flexShrink: 0 }} />
          <span>Settings locked during active call. Stop session to modify.</span>
        </div>
      )}

      {/* 1. Learner Proficiency Level */}
      <div style={{ marginBottom: 8, fontSize: '0.8rem', color: '#A7C7E7', fontWeight: 600 }}>
        Learner Proficiency Level (CEFR Alignment):
      </div>
      <div className="level-selector" style={{ marginBottom: 16 }}>
        {levels.map((lvl) => (
          <button
            key={lvl.id}
            id={`level-btn-${lvl.id}`}
            disabled={isLocked}
            className={`level-btn ${level === lvl.id ? 'active' : ''}`}
            style={{
              opacity: isLocked && level !== lvl.id ? 0.4 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer',
              display: 'flex',
              gap: 4,
            }}
            onClick={() => setLevel(lvl.id)}
            title={isLocked ? 'Settings locked during session' : `Select ${lvl.label}`}
          >
            <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em]">{lvl.label}</span>
            <span className="font-montserrat font-semibold text-[0.68rem] uppercase tracking-[0.15em] text-[#E09B30]">{lvl.sub}</span>
          </button>
        ))}
      </div>

      {/* 2. Error Correction Mode Toggle */}
      <div style={{ marginBottom: 8, fontSize: '0.8rem', color: '#A7C7E7', fontWeight: 600 }}>
        Error Correction Mode:
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {correctionModes.map((m) => {
          const isActive = correctionMode === m.id;
          return (
            <button
              key={m.id}
              id={`correction-mode-${m.id}-btn`}
              disabled={isLocked}
              onClick={() => setCorrectionMode(m.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'rgba(224, 155, 48, 0.15)' : 'rgba(167, 199, 231, 0.08)',
                border: isActive
                  ? '1px solid #E09B30'
                  : '1px solid var(--border-subtle)',
                color: isActive ? '#FAFAFA' : '#A7C7E7',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked && !isActive ? 0.4 : 1,
                textAlign: 'left',
                transition: 'var(--transition)',
              }}
              title={isLocked ? 'Settings locked during session' : m.desc}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: 3,
                  color: isActive ? '#E09B30' : '#FAFAFA',
                }}
              >
                {m.id === 'conversation' ? <MessageSquare size={13} /> : <Sparkles size={13} />}
                <span>{m.label}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#A7C7E7', lineHeight: 1.35 }}>
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Conversation Scenario */}
      <div style={{ marginBottom: 8, fontSize: '0.8rem', color: '#A7C7E7', fontWeight: 600 }}>
        Select Conversation Scenario:
      </div>
      <div className="topic-list" style={{ marginBottom: 16 }}>
        {availableScenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId;
          return (
            <div
              key={scenario.id}
              id={`scenario-card-${scenario.id}`}
              className={`topic-card ${isSelected ? 'active' : ''}`}
              style={{
                opacity: isLocked && !isSelected ? 0.4 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
              }}
              onClick={() => selectScenario(scenario.id)}
            >
              <div className="topic-header">
                <span className="topic-title">{scenario.title}</span>
                <span className="topic-category font-montserrat font-bold text-[0.68rem] uppercase tracking-[0.15em] text-[#E09B30]">{scenario.category}</span>
              </div>
              <p className="topic-desc">{scenario.description}</p>
            </div>
          );
        })}
      </div>

      {/* 4. Target Curriculum Badges */}
      {activeScenario && (
        <div style={{ marginTop: 14, borderTop: '1px solid rgba(167, 199, 231, 0.2)', paddingTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#FAFAFA', marginBottom: 8 }}>
            <Award size={14} color="#E09B30" />
            <strong>Target Vocabulary Focus:</strong>
          </div>
          <div className="tag-cloud">
            {activeScenario.targetVocabulary.map((vocab) => (
              <span key={vocab} className="tag-pill font-montserrat uppercase tracking-[0.15em] text-[0.7rem]">
                {vocab}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#FAFAFA', marginTop: 12, marginBottom: 8 }}>
            <CheckCircle size={14} color="#10b981" />
            <strong>Target Grammar Focus:</strong>
          </div>
          <ul style={{ paddingLeft: 18, fontSize: '0.78rem', color: '#A7C7E7', lineHeight: 1.5 }}>
            {activeScenario.targetGrammar.map((grammar) => (
              <li key={grammar}>{grammar}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Collapsible 'Active Tutor Instructions' Panel (Requirement 6) */}
      <div
        id="active-tutor-instructions-panel"
        style={{
          marginTop: 18,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            padding: '4px 0',
          }}
          onClick={() => setIsPromptExpanded(!isPromptExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <FileText size={15} color="#818cf8" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
              Active Tutor Instructions
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.05)',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              {isLocked ? 'Session Active' : 'Live Preview'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isPromptExpanded ? <ChevronUp size={15} color="#94a3b8" /> : <ChevronDown size={15} color="#94a3b8" />}
          </div>
        </div>

        {isPromptExpanded && (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
                fontSize: '0.72rem',
                color: '#94a3b8',
              }}
            >
              <span>Exact systemInstruction payload sent to Live API setup frame:</span>
              <button
                className="level-btn"
                style={{ padding: '3px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={handleCopyInstruction}
                title="Copy instructions to clipboard"
              >
                {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre
              id="active-instruction-text"
              style={{
                padding: '12px 14px',
                background: '#04060d',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                lineHeight: 1.5,
                color: '#93c5fd',
                maxHeight: 220,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              {currentInstruction}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
