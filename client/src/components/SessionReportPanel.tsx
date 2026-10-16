import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Award,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  Clock,
  MessageSquare,
  Trash2,
  X,
  Play,
  Shield,
  History,
  Info,
} from 'lucide-react';
import { useReportStore } from '../modules/report/reportStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { SessionReport } from '../modules/report/types';

export const SessionReportPanel: React.FC = () => {
  const {
    currentReport,
    isGenerating,
    error,
    isRateLimited,
    tooShortNotice,
    savedReports,
    reportsEnabled,
    isHistoryOpen,
    loadSavedReports,
    retryGeneration,
    dismissReport,
    deleteReport,
    deleteAllReports,
    setReportsEnabled,
    setHistoryOpen,
    viewReport,
  } = useReportStore();

  const startSession = useConversationStore((s) => s.startSession);
  const setCustomExerciseScenario = useTeachingStore((s) => s.setCustomExerciseScenario);

  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  useEffect(() => {
    loadSavedReports();
  }, [loadSavedReports]);

  // Handler for 'Practice this exercise' button (Requirement 5)
  const handlePracticeExercise = (exerciseText: string) => {
    setCustomExerciseScenario(exerciseText);
    dismissReport();
    startSession();
  };

  // If reports are disabled and no active report or notices, show simple setting toggle in panel
  const hasActiveContent =
    isGenerating || currentReport || error || tooShortNotice || isHistoryOpen;

  return (
    <div className="glass-panel" id="session-report-container" style={{ padding: '20px 24px' }}>
      {/* Panel Header */}
      <div className="panel-header" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(224, 155, 48, 0.15)',
              border: '1px solid rgba(224, 155, 48, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E09B30',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="panel-title" style={{ fontSize: '1.05rem', margin: 0 }}>
              End-of-Session Pedagogical Report
            </h2>
            <div style={{ fontSize: '0.74rem', color: '#A7C7E7' }}>
              Structured AI analysis via Gemini Flash with automated fallback (Server-Side)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* History Toggle */}
          <button
            id="view-report-history-btn"
            className="level-btn"
            style={{
              padding: '5px 10px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: isHistoryOpen ? 'rgba(99, 102, 241, 0.2)' : undefined,
              borderColor: isHistoryOpen ? 'var(--accent-primary)' : undefined,
              color: isHistoryOpen ? '#fff' : 'var(--text-muted)',
            }}
            onClick={() => setHistoryOpen(!isHistoryOpen)}
            title="View past session reports stored in IndexedDB"
          >
            <History size={14} />
            <span>History ({savedReports.length})</span>
          </button>

          {/* Dismiss button when report or notice is visible */}
          {(currentReport || tooShortNotice || error) && (
            <button
              id="dismiss-report-btn"
              className="icon-btn"
              onClick={dismissReport}
              title="Dismiss report"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* History Drawer / Modal */}
      {isHistoryOpen && (
        <div
          id="report-history-modal"
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
              Saved Session Reports (IndexedDB)
            </div>
            {savedReports.length > 0 && (
              <div>
                {confirmDeleteAll ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="level-btn"
                      style={{ padding: '3px 8px', fontSize: '0.7rem', color: '#f87171' }}
                      onClick={() => {
                        deleteAllReports();
                        setConfirmDeleteAll(false);
                      }}
                    >
                      Confirm Delete All
                    </button>
                    <button
                      className="level-btn"
                      style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      onClick={() => setConfirmDeleteAll(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    id="delete-all-reports-btn"
                    className="level-btn"
                    style={{ padding: '3px 8px', fontSize: '0.7rem', color: '#f87171' }}
                    onClick={() => setConfirmDeleteAll(true)}
                  >
                    Delete All
                  </button>
                )}
              </div>
            )}
          </div>

          {savedReports.length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
              No saved reports in IndexedDB yet. Complete a speaking session to generate one!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {savedReports.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => {
                      viewReport(rep);
                      setHistoryOpen(false);
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6' }}>
                      {rep.scenarioTitle}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(rep.createdAt).toLocaleDateString()} at{' '}
                      {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      • {rep.stats.durationFormatted} • {rep.stats.learnerTurns} turns
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      className="icon-btn"
                      style={{ width: 26, height: 26 }}
                      onClick={() => {
                        viewReport(rep);
                        setHistoryOpen(false);
                      }}
                      title="View report"
                    >
                      <BookOpen size={13} color="#818cf8" />
                    </button>
                    <button
                      className="icon-btn"
                      style={{ width: 26, height: 26 }}
                      onClick={() => deleteReport(rep.id)}
                      title="Delete report"
                    >
                      <Trash2 size={13} color="#f87171" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1. Loading / Generating State */}
      {isGenerating && (
        <div
          id="report-generating-spinner"
          style={{
            padding: '24px 20px',
            textAlign: 'center',
            background: 'rgba(99, 102, 241, 0.06)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            marginBottom: 12,
          }}
        >
          <div className="spinner" style={{ margin: '0 auto 12px', width: 26, height: 26, border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#818cf8', borderRadius: '50%' }} />
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f3f4f6', marginBottom: 4 }}>
            Analyzing Session Transcript...
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
            Gemini Flash is identifying strengths, verbatim grammar feedback, and your next exercise.
          </p>
        </div>
      )}

      {/* 2. Too Short Notification */}
      {tooShortNotice && !isGenerating && (
        <div
          id="report-too-short-notice"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '14px 16px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#fde68a',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          <Info size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Session Too Short for Pedagogical Analysis:</strong>
            <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.8rem' }}>
              {tooShortNotice}
            </p>
          </div>
        </div>
      )}

      {/* 3. Error / Rate-Limit State with Retry */}
      {error && !isGenerating && (
        <div
          id="report-error-card"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 16px',
            background: isRateLimited ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: isRateLimited ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: isRateLimited ? '#fde68a' : '#fca5a5',
            fontSize: '0.82rem',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>{isRateLimited ? 'Rate Limit Reached' : 'Report Generation Error'}:</strong>
              <div style={{ marginTop: 2, color: 'var(--text-main)', fontSize: '0.8rem' }}>{error}</div>
            </div>
          </div>
          <button
            id="retry-report-btn"
            className="level-btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.76rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255, 255, 255, 0.1)',
            }}
            onClick={retryGeneration}
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4. Full Report Render */}
      {currentReport && !isGenerating && (
        <div id="active-session-report-view">
          {/* Metadata & Stats Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Duration</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f3f4f6' }}>{currentReport.stats.durationFormatted}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Learner Turns</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>{currentReport.stats.learnerTurns}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Words Spoken</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399' }}>{currentReport.stats.learnerWords}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Est. Pace</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>
                ~{currentReport.stats.estimatedWpm} <span style={{ fontSize: '0.68rem', fontWeight: 400, color: '#94a3b8' }}>WPM (approx)</span>
              </div>
            </div>
            {currentReport.modelUsed && (
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Model</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#a78bfa' }}>{currentReport.modelUsed}</div>
              </div>
            )}
          </div>

          {/* Pedagogical Summary */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: '0.74rem', color: '#818cf8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
              Pedagogical Evaluation
            </div>
            <p style={{ fontSize: '0.86rem', color: '#f3f4f6', lineHeight: 1.5, margin: 0 }}>
              {currentReport.summary}
            </p>
          </div>

          {/* Strengths */}
          {currentReport.strengths.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#34d399', marginBottom: 8 }}>
                <CheckCircle2 size={16} />
                <span>Demonstrated Strengths</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {currentReport.strengths.map((str, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(52, 211, 153, 0.06)',
                      border: '1px solid rgba(52, 211, 153, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      color: '#e2e8f0',
                      lineHeight: 1.4,
                    }}
                  >
                    • {str}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Errors / Natural Recasts */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>
              <Award size={16} />
              <span>Targeted Corrections &amp; Natural Usage</span>
            </div>

            {currentReport.topErrors.length === 0 ? (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(52, 211, 153, 0.06)',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                  fontSize: '0.8rem',
                  color: '#a7f3d0',
                }}
              >
                No major grammatical errors detected in this session. Clean, accurate spoken execution!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentReport.topErrors.map((err, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.76rem', color: '#f87171', marginBottom: 3 }}>
                      <strong>You said:</strong> "{err.original}"
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, marginBottom: 4 }}>
                      <strong>More natural:</strong> "{err.corrected}"
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {err.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Target Vocabulary Used */}
          {currentReport.vocabularyUsed.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: 6 }}>
                Target Vocabulary Successfully Applied:
              </div>
              <div className="tag-cloud">
                {currentReport.vocabularyUsed.map((vocab, idx) => (
                  <span key={idx} className="tag-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.35)', color: '#38bdf8' }}>
                    ✓ {vocab}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Exercise & 'Practice This Exercise' Button (Requirement 5) */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(224, 155, 48, 0.08)',
              border: '1px solid rgba(224, 155, 48, 0.3)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#E09B30', fontWeight: 700, marginBottom: 4 }}>
              <Sparkles size={14} />
              <span>Recommended Follow-Up Exercise</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#FAFAFA', lineHeight: 1.45, marginBottom: 12 }}>
              {currentReport.nextExercise}
            </p>
            <button
              id="practice-exercise-btn"
              className="btn-session btn-start"
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => handlePracticeExercise(currentReport.nextExercise)}
            >
              <Play size={15} fill="currentColor" />
              <span>Practice this exercise now</span>
            </button>
          </div>

          {/* Pronunciation Note Disclaimer (Requirement 4) */}
          <div
            style={{
              fontSize: '0.72rem',
              color: '#64748b',
              lineHeight: 1.4,
              fontStyle: 'italic',
              marginBottom: 8,
            }}
          >
            {currentReport.pronunciationNote}
          </div>
        </div>
      )}

      {/* Privacy Notice & Settings Toggle (Requirement 7) */}
      <div
        style={{
          marginTop: currentReport || isGenerating ? 12 : 0,
          paddingTop: 10,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: '0.72rem',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={13} color="#94a3b8" />
          <span>
            <strong>Privacy Guarantee:</strong> Only text transcripts are sent to Google Gemini (<code>Gemini Flash fallback chain</code>) for analysis. Raw audio is never stored.
          </span>
        </div>

        {/* Setting Toggle: Generate Reports (Requirement 7) */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            color: reportsEnabled ? '#a5b4fc' : '#64748b',
            userSelect: 'none',
          }}
          title="Toggle automatic AI report generation when a session ends"
        >
          <input
            type="checkbox"
            id="toggle-reports-enabled-checkbox"
            checked={reportsEnabled}
            onChange={(e) => setReportsEnabled(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Generate AI reports on session end</span>
        </label>
      </div>
    </div>
  );
};
