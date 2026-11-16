import React, { useState, useEffect } from 'react';
import { Target, Sparkles, Award, Compass, BookOpen, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '../modules/auth/authStore';
import { useSprintStore } from '../modules/sprint/sprintStore';
import { LearningGoals } from '../modules/auth/types';
import { useTranslation } from '../modules/i18n/languageStore';
import { getApiUrl } from '../config/api';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1 / IELTS'] as const;

const PRIMARY_GOALS = [
  'Tech & Job Interviews',
  'University Scholarship',
  'IELTS Exam Prep',
  'Business & Executive English',
  'Daily Conversational Fluency',
] as const;

const FOCUS_SKILLS = [
  'Speaking Fluency & Pronunciation',
  'Grammar & Syntax Accuracy',
  'Professional Vocabulary & Collocations',
  'Listening Comprehension',
] as const;

export interface GoalsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const MandatoryGoalsModal: React.FC<GoalsModalProps> = ({
  isOpen = false,
  onClose,
}) => {
  const { user, isAuthenticated, saveProfileGoals } = useAuthStore();
  const setPersonalizedSprint = useSprintStore((s) => s.setPersonalizedSprint);
  const { t, isEs } = useTranslation();

  const [targetLevel, setTargetLevel] = useState<string>(
    user?.learningGoals?.targetLevel || 'B1'
  );
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    user?.learningGoals?.primaryGoal || 'Tech & Job Interviews'
  );
  const [focusSkill, setFocusSkill] = useState<string>(
    user?.learningGoals?.focusSkill || 'Speaking Fluency & Pronunciation'
  );
  const [personalObjective, setPersonalObjective] = useState<string>(
    user?.learningGoals?.personalObjective || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with user's existing goals when opened
  useEffect(() => {
    if (user?.learningGoals) {
      if (user.learningGoals.targetLevel) setTargetLevel(user.learningGoals.targetLevel);
      if (user.learningGoals.primaryGoal) setPrimaryGoal(user.learningGoals.primaryGoal);
      if (user.learningGoals.focusSkill) setFocusSkill(user.learningGoals.focusSkill);
      if (user.learningGoals.personalObjective) setPersonalObjective(user.learningGoals.personalObjective);
    }
  }, [user, isOpen]);

  // NEVER auto-pop-up on initial page load. Opens ONLY when explicitly triggered (e.g. from Edit Goals)
  if (!isOpen || !isAuthenticated) {
    return null;
  }

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedObjective = personalObjective.trim();
    if (!trimmedObjective) {
      setError(
        isEs
          ? 'Por favor escribe tu objetivo personal específico para personalizar tu plan.'
          : 'Please enter your specific personal goal to tailor your plan.'
      );
      return;
    }

    setIsSubmitting(true);

    const goals: LearningGoals = {
      targetLevel,
      primaryGoal,
      focusSkill,
      personalObjective: trimmedObjective,
    };

    try {
      // 1. Save profile to database
      await saveProfileGoals(goals);

      // 2. Request AI Personalized 5-Day Micro-Learning Sprint
      try {
        const res = await fetch(getApiUrl('/api/curriculum/generate-sprint'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ learningGoals: goals }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.sprint) {
            setPersonalizedSprint(data.sprint);
          }
        }
      } catch (genErr) {
        console.warn('[MandatoryGoalsModal] Sprint generator warning:', genErr);
      }

      if (onClose) onClose();
    } catch (saveErr: unknown) {
      const msg = saveErr instanceof Error ? saveErr.message : String(saveErr);
      setError(msg || 'Error saving learning goals. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="goals-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#1A3153]/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mandatory-goals-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div
        id="mandatory-goals-modal-card"
        className="relative w-full max-w-2xl bg-[#FAFAFA] text-[#1A3153] border-2 border-[#E09B30] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1A3153] to-[#12223a] text-[#FAFAFA] border-b border-[#A7C7E7]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center text-[#E09B30]">
              <Target size={20} />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E09B30] text-[#1A3153] text-[10px] font-montserrat font-black uppercase tracking-wider mb-1">
                {t.mandatoryGoalsModal.badge}
              </span>
              <h2
                id="mandatory-goals-title"
                className="font-montserrat font-extrabold text-base sm:text-lg tracking-tight leading-snug"
              >
                {t.mandatoryGoalsModal.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="close-goals-modal-btn"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 text-[#FAFAFA] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <p className="font-inter text-xs text-[#4A5568] leading-relaxed">
            {t.mandatoryGoalsModal.subtitle}
          </p>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. CEFR Level Selector */}
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-2 flex items-center gap-1.5">
                <Award size={14} className="text-[#E09B30]" />
                <span>{t.mandatoryGoalsModal.levelLabel}</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CEFR_LEVELS.map((lvl) => {
                  const isSelected = targetLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setTargetLevel(lvl)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-montserrat font-bold transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A3153] text-[#E09B30] border-[#E09B30] shadow-sm ring-1 ring-[#E09B30]'
                          : 'bg-[#FAFAFA] text-[#1A3153] border-[#A7C7E7]/60 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Primary Learning Goal */}
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-2 flex items-center gap-1.5">
                <Compass size={14} className="text-[#E09B30]" />
                <span>{t.mandatoryGoalsModal.primaryGoalLabel}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRIMARY_GOALS.map((goal) => {
                  const isSelected = primaryGoal === goal;
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setPrimaryGoal(goal)}
                      className={`p-3 rounded-2xl border text-left text-xs font-montserrat font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A3153] text-[#FAFAFA] border-[#E09B30] shadow-md ring-1 ring-[#E09B30]'
                          : 'bg-[#FAFAFA] text-[#1A3153] border-[#A7C7E7]/60 hover:bg-slate-100'
                      }`}
                    >
                      <span>{goal}</span>
                      {isSelected && <CheckCircle2 size={15} className="text-[#E09B30] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Priority Skill Focus */}
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-2 flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#E09B30]" />
                <span>{t.mandatoryGoalsModal.focusSkillLabel}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FOCUS_SKILLS.map((skill) => {
                  const isSelected = focusSkill === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setFocusSkill(skill)}
                      className={`p-3 rounded-2xl border text-left text-xs font-montserrat font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A3153] text-[#FAFAFA] border-[#E09B30] shadow-md ring-1 ring-[#E09B30]'
                          : 'bg-[#FAFAFA] text-[#1A3153] border-[#A7C7E7]/60 hover:bg-slate-100'
                      }`}
                    >
                      <span>{skill}</span>
                      {isSelected && <CheckCircle2 size={15} className="text-[#E09B30] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Specific Personal Goal (Required Input) */}
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1.5 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#E09B30]" />
                <span>{t.mandatoryGoalsModal.personalObjectiveLabel}</span>
                <span className="text-[#E09B30]">*</span>
              </label>
              <textarea
                id="goals-personal-objective-input"
                required
                rows={2}
                value={personalObjective}
                onChange={(e) => setPersonalObjective(e.target.value)}
                placeholder={t.mandatoryGoalsModal.personalObjectivePlaceholder}
                className="w-full p-3 rounded-2xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30] leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="submit-mandatory-goals-btn"
              disabled={isSubmitting || !personalObjective.trim()}
              className="w-full py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-md shadow-[#E09B30]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.mandatoryGoalsModal.generatingSprint}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{t.mandatoryGoalsModal.submitBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MandatoryGoalsModal;
