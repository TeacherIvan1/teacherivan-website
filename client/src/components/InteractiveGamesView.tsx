import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useSprintStore } from '../modules/sprint/sprintStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';

type GameTab = 'recast' | 'matcher' | 'builder';

interface RecastQuestion {
  id: number;
  badSentence: string;
  errorContext: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface MatchPair {
  id: string;
  term: string;
  definition: string;
}

interface BuilderChallenge {
  id: number;
  hint: string;
  targetSentence: string[];
  shuffledWords: string[];
  pedagogicalTip: string;
}

export const InteractiveGamesView: React.FC = () => {
  const { t, isEs } = useTranslation();
  const { recordGameResult, totalXp } = useSprintStore();
  const { persona } = useTeachingStore();

  const tutorAvatarSrc = persona === 'emma' ? '/assets/emma-rig.svg' : '/assets/teacher-ivan-rig.svg';
  const tutorAvatarAlt = persona === 'emma' ? 'Emma' : 'Teacher Ivan';

  const [activeTab, setActiveTab] = useState<GameTab>('recast');

  // GAME 1: RECAST STATE
  const recastQuestions: RecastQuestion[] = [
    {
      id: 1,
      badSentence: 'I have 25 years and I work in software.',
      errorContext: 'Spanish interference with age: "tener años"',
      options: [
        'I have 25 years old and I work in software.',
        'I am 25 years old and I work in software.',
        'I possess 25 years and I work in software.',
      ],
      correctIndex: 1,
      explanation: isEs
        ? 'En inglés, la edad es un estado, no una posesión: se usa siempre "I am 25" o "I am 25 years old", nunca "I have".'
        : 'Age in English expresses state of being, not possession. Always use "to be": "I am 25" or "I am 25 years old".',
    },
    {
      id: 2,
      badSentence: 'May you suggest me a good solution for this?',
      errorContext: 'Direct object syntax with "suggest"',
      options: [
        'Could you recommend a good solution to me?',
        'May you suggest to me a good solution for this?',
        'Do you can suggest me one good solution?',
      ],
      correctIndex: 0,
      explanation: isEs
        ? '"Suggest" nunca toma pronombre objeto directo ("suggest me"). Se usa "suggest something to someone" o mejor "recommend ... to me".'
        : '"Suggest" cannot take an indirect personal object directly ("suggest me"). Use "recommend X to me" or "suggest doing X".',
    },
    {
      id: 3,
      badSentence: 'I am agree with the architectural trade-offs.',
      errorContext: 'Overusing "to be" with the verb "agree"',
      options: [
        'I am agreeing with the trade-offs completely.',
        'I agree with the architectural trade-offs.',
        'I have agreement with the trade-offs.',
      ],
      correctIndex: 1,
      explanation: isEs
        ? '"Agree" es un verbo completo en inglés, no un adjetivo. Se dice "I agree", nunca "I am agree".'
        : '"Agree" is a main verb, not an adjective. Say "I agree", never "I am agree".',
    },
    {
      id: 4,
      badSentence: 'I look forward to hear from the hiring team.',
      errorContext: 'Preposition "to" requiring a gerund (-ing)',
      options: [
        'I look forward to hearing from the hiring team.',
        'I look forward for hear from the hiring team.',
        'I am looking forward to heard from the hiring team.',
      ],
      correctIndex: 0,
      explanation: isEs
        ? 'En la frase hecha "look forward to", "to" es una preposición, por lo que el verbo siguiente debe llevar -ing: "hearing".'
        : 'In "look forward to", "to" is a preposition, which requires a following noun or gerund (-ing): "hearing".',
    },
    {
      id: 5,
      badSentence: 'People is very friendly in this department.',
      errorContext: 'Plural agreement with "people"',
      options: [
        'People are very friendly in this department.',
        'Persons is very friendly in this department.',
        'People has very friendly in this department.',
      ],
      correctIndex: 0,
      explanation: isEs
        ? '"People" es un sustantivo colectivo en plural y concuerda con "are", no "is".'
        : '"People" is an irregular plural noun and strictly agrees with "are", never "is".',
    },
    {
      id: 6,
      badSentence: 'I am working at this company since two years.',
      errorContext: 'Unfinished duration requiring "for" and Present Perfect Continuous',
      options: [
        'I work at this company since two years ago.',
        'I have been working at this company for two years.',
        'I am working at this company during two years.',
      ],
      correctIndex: 1,
      explanation: isEs
        ? 'Acciones iniciadas en el pasado que continúan hoy usan Present Perfect Continuous + "for" para periodos de tiempo ("for two years").'
        : 'Actions that started in the past and continue into the present use Present Perfect Continuous + "for" with durations.',
    },
  ];

  const [currentRecastIndex, setCurrentRecastIndex] = useState(0);
  const [selectedRecastOption, setSelectedRecastOption] = useState<number | null>(null);
  const [recastStreak, setRecastStreak] = useState(0);
  const [recastCorrectCount, setRecastCorrectCount] = useState(0);
  const [isRecastFinished, setIsRecastFinished] = useState(false);

  const handleSelectRecast = (optionIdx: number) => {
    if (selectedRecastOption !== null) return;
    setSelectedRecastOption(optionIdx);
    const q = recastQuestions[currentRecastIndex];
    if (optionIdx === q.correctIndex) {
      setRecastStreak((prev) => prev + 1);
      setRecastCorrectCount((prev) => prev + 1);
    } else {
      setRecastStreak(0);
    }
  };

  const handleNextRecast = () => {
    if (currentRecastIndex < recastQuestions.length - 1) {
      setCurrentRecastIndex((prev) => prev + 1);
      setSelectedRecastOption(null);
    } else {
      setIsRecastFinished(true);
      const acc = Math.round((recastCorrectCount / recastQuestions.length) * 100);
      recordGameResult('recast-challenge', acc, recastCorrectCount * 10, 75);
    }
  };

  const handleResetRecast = () => {
    setCurrentRecastIndex(0);
    setSelectedRecastOption(null);
    setRecastStreak(0);
    setRecastCorrectCount(0);
    setIsRecastFinished(false);
  };

  // GAME 2: MATCHER STATE
  const matchPairs: MatchPair[] = [
    {
      id: 'm1',
      term: 'Academic Merit',
      definition: isEs ? 'Excelencia demostrada en calificaciones y proyectos' : 'Excellence based on grades and scholarly work',
    },
    {
      id: 'm2',
      term: 'Scalability',
      definition: isEs ? 'Capacidad de un sistema de crecer con alta demanda' : 'Ability of a system to handle growing workloads',
    },
    {
      id: 'm3',
      term: 'Wind Down',
      definition: isEs ? 'Relajarse paulatinamente tras una jornada intensa' : 'Relax gradually after intense activity',
    },
    {
      id: 'm4',
      term: 'Break Down',
      definition: isEs ? 'Desglosar un problema complejo en partes manejables' : 'Decompose a complex issue into manageable parts',
    },
    {
      id: 'm5',
      term: 'Financial Aid',
      definition: isEs ? 'Fondos o becas para cubrir aranceles universitarios' : 'Tuition grants or funding for education',
    },
    {
      id: 'm6',
      term: 'Key Trade-Off',
      definition: isEs ? 'Compromiso estratégico entre dos ventajas técnicas' : 'Strategic compromise between design advantages',
    },
  ];

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matcherAttempts, setMatcherAttempts] = useState(0);

  const handleSelectTerm = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedTerm(id);
    if (selectedDefinition) {
      evaluateMatch(id, selectedDefinition);
    }
  };

  const handleSelectDefinition = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedDefinition(id);
    if (selectedTerm) {
      evaluateMatch(selectedTerm, id);
    }
  };

  const evaluateMatch = (termId: string, defId: string) => {
    setMatcherAttempts((prev) => prev + 1);
    if (termId === defId) {
      const updated = [...matchedIds, termId];
      setMatchedIds(updated);
      setSelectedTerm(null);
      setSelectedDefinition(null);
      if (updated.length === matchPairs.length) {
        recordGameResult('collocation-matcher', 95, 60, 75);
      }
    } else {
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedDefinition(null);
      }, 500);
    }
  };

  const handleResetMatcher = () => {
    setMatchedIds([]);
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setMatcherAttempts(0);
  };

  // GAME 3: SENTENCE BUILDER STATE
  const builderChallenges: BuilderChallenge[] = [
    {
      id: 1,
      hint: isEs ? 'Construye la oración técnica sobre arquitectura de cache:' : 'Construct the technical sentence on cache architecture:',
      targetSentence: ['Having', 'analyzed', 'the', 'system', 'constraints,', 'I', 'proposed', 'a', 'caching', 'layer.'],
      shuffledWords: ['caching', 'constraints,', 'Having', 'proposed', 'layer.', 'the', 'system', 'analyzed', 'a', 'I'],
      pedagogicalTip: isEs
        ? 'Uso de cláusula de participio ("Having analyzed...") para sonar como ingeniero sénior en entrevistas.'
        : 'Participle clauses ("Having analyzed...") convey senior-level conciseness in system design discussions.',
    },
    {
      id: 2,
      hint: isEs ? 'Construye la oración condicional invertida para panel de beca:' : 'Construct the inverted conditional for a scholarship panel:',
      targetSentence: ['Were', 'I', 'awarded', 'the', 'scholarship,', 'I', 'would', 'contribute', 'to', 'research.'],
      shuffledWords: ['would', 'Were', 'awarded', 'the', 'to', 'scholarship,', 'I', 'contribute', 'research.', 'I'],
      pedagogicalTip: isEs
        ? 'Inversión condicional de segundo grado ("Were I awarded..." en lugar de "If I were awarded...") para máximo puntaje IELTS.'
        : 'Second conditional inversion ("Were I awarded..." instead of "If I were...") scores maximum lexical/grammatical band.',
    },
    {
      id: 3,
      hint: isEs ? 'Construye la oración con inversión negativa para narrar un logro laboral:' : 'Construct the negative inversion sentence highlighting achievements:',
      targetSentence: ['Not', 'only', 'did', 'we', 'deliver,', 'but', 'we', 'also', 'improved', 'latency.'],
      shuffledWords: ['also', 'deliver,', 'we', 'only', 'did', 'Not', 'we', 'improved', 'latency.', 'but'],
      pedagogicalTip: isEs
        ? 'Inversión enfática ("Not only did we...") para demostrar impacto cuantitativo sin sonar repetitivo.'
        : 'Emphatic inversion ("Not only did we...") highlights achievements with executive polish.',
    },
  ];

  const [currentBuilderIndex, setCurrentBuilderIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [builderStatus, setBuilderStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  const currentChallenge = builderChallenges[currentBuilderIndex];

  const handleAddWord = (word: string, indexInShuffled: number) => {
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (wordIndex: number) => {
    setSelectedWords((prev) => prev.filter((_, idx) => idx !== wordIndex));
    setBuilderStatus('IDLE');
  };

  const handleCheckSentence = () => {
    const isExact =
      selectedWords.length === currentChallenge.targetSentence.length &&
      selectedWords.every((w, idx) => w === currentChallenge.targetSentence[idx]);

    if (isExact) {
      setBuilderStatus('CORRECT');
      recordGameResult('sentence-builder', 100, 50, 75);
    } else {
      setBuilderStatus('WRONG');
    }
  };

  const handleNextBuilder = () => {
    if (currentBuilderIndex < builderChallenges.length - 1) {
      setCurrentBuilderIndex((prev) => prev + 1);
      setSelectedWords([]);
      setBuilderStatus('IDLE');
    }
  };

  const handleClearBuilder = () => {
    setSelectedWords([]);
    setBuilderStatus('IDLE');
  };

  return (
    <div id="interactive-games-view" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
          <Gamepad2 size={14} />
          <span>{t.gamesView.badge}</span>
        </div>
        <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
          {t.gamesView.title}
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
          {t.gamesView.subtitle}
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-full bg-[#12223a] border border-[#A7C7E7]/30 max-w-xl mx-auto w-full shadow-inner">
        <button
          id="game-tab-recast"
          onClick={() => setActiveTab('recast')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'recast'
              ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
              : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
          }`}
        >
          <Zap size={14} />
          <span>{t.gamesView.tabRecast}</span>
        </button>

        <button
          id="game-tab-matcher"
          onClick={() => setActiveTab('matcher')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'matcher'
              ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
              : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
          }`}
        >
          <Sparkles size={14} />
          <span>{t.gamesView.tabMatcher}</span>
        </button>

        <button
          id="game-tab-builder"
          onClick={() => setActiveTab('builder')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'builder'
              ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
              : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
          }`}
        >
          <Trophy size={14} />
          <span>{t.gamesView.tabBuilder}</span>
        </button>
      </div>

      {/* GAME 1: QUICK RECAST CHALLENGE */}
      {activeTab === 'recast' && (
        <div className="max-w-3xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-[#12223a]/90 border border-[#A7C7E7]/25 shadow-2xl space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between border-b border-[#A7C7E7]/20 pb-4">
            <div>
              <span className="text-xs font-bold text-[#E09B30] uppercase tracking-wider block">
                {isEs ? 'Desafío' : 'Challenge'} {currentRecastIndex + 1} / {recastQuestions.length}
              </span>
              <p className="font-inter text-xs text-[#A7C7E7]">
                {t.gamesView.recastDesc}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E09B30]/15 text-[#E09B30] font-montserrat font-bold text-xs">
                <Flame size={14} />
                <span>
                  {t.gamesView.streak}: {recastStreak}
                </span>
              </span>
            </div>
          </div>

          {!isRecastFinished ? (
            <div className="space-y-6">
              {/* Bad Sentence Banner with Chibi Teacher Ivan Recast Mascot */}
              <div className="p-5 rounded-2xl bg-[#1A3153] border-2 border-[#f59e0b]/40 flex items-start gap-4">
                <img
                  src={tutorAvatarSrc}
                  alt={tutorAvatarAlt}
                  className="w-12 h-12 rounded-full bg-[#FAFAFA] p-1 shrink-0 object-contain shadow-md"
                />
                <div>
                  <span className="text-[11px] font-mono text-[#f59e0b] uppercase font-bold tracking-wider block mb-1">
                    ⚠️ {isEs ? 'Frase con Error Común' : 'Common Spanish Interference'}:
                  </span>
                  <p className="font-montserrat font-extrabold text-base sm:text-lg text-[#FAFAFA] italic">
                    "{recastQuestions[currentRecastIndex].badSentence}"
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <span className="text-xs font-montserrat font-bold text-[#A7C7E7] uppercase tracking-wider block">
                  {isEs ? 'Elige la reformulación nativa correcta:' : 'Select the natural native recast:'}
                </span>

                {recastQuestions[currentRecastIndex].options.map((opt, optIdx) => {
                  const isSelected = selectedRecastOption === optIdx;
                  const isCorrect = optIdx === recastQuestions[currentRecastIndex].correctIndex;

                  let btnStyle = 'bg-[#1A3153]/80 hover:bg-[#1A3153] border-[#A7C7E7]/20 text-[#FAFAFA]';
                  if (selectedRecastOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-[#10b981]/25 border-[#10b981] text-[#FAFAFA] shadow-md';
                    } else if (isSelected) {
                      btnStyle = 'bg-[#ef4444]/25 border-[#ef4444] text-[#FAFAFA]';
                    } else {
                      btnStyle = 'opacity-40 border-[#A7C7E7]/10 text-[#A7C7E7]';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectRecast(optIdx)}
                      disabled={selectedRecastOption !== null}
                      className={`w-full p-4 rounded-2xl border text-left font-inter text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedRecastOption !== null && isCorrect && (
                        <CheckCircle2 size={18} className="text-[#10b981] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {selectedRecastOption !== null && (
                <div className="p-4 rounded-2xl bg-[#1A3153]/70 border border-[#E09B30]/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E09B30]">
                    <Sparkles size={15} />
                    <span>{t.gamesView.recastAlert}</span>
                  </div>
                  <p className="font-inter text-xs text-[#FAFAFA]/90 leading-relaxed">
                    {recastQuestions[currentRecastIndex].explanation}
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleNextRecast}
                      className="py-2.5 px-6 rounded-full bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>{t.gamesView.nextQuestion}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Finished Results Screen */
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] mx-auto">
                <Trophy size={32} />
              </div>
              <h3 className="font-montserrat font-extrabold text-2xl text-[#FAFAFA]">
                {t.gamesView.greatJob}
              </h3>
              <p className="font-inter text-sm text-[#A7C7E7] max-w-md mx-auto">
                {isEs
                  ? `Completaste todos los desafíos con ${recastCorrectCount} aciertos. ¡Tu cerebro acaba de reprogramar reflejos automáticos en inglés!`
                  : `You solved all recast questions with ${recastCorrectCount} correct answers. Automatic fluency reflexes updated!`}
              </p>
              <div className="inline-block px-4 py-2 rounded-full bg-[#E09B30]/20 text-[#E09B30] font-montserrat font-bold text-sm">
                +75 XP • {isEs ? 'Día 2 del Sprint Completado ✓' : 'Sprint Day 2 Stage Complete ✓'}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleResetRecast}
                  className="py-3 px-6 rounded-full bg-[#1A3153] hover:bg-[#A7C7E7]/20 border border-[#A7C7E7]/30 text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>{t.gamesView.playAgain}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: COLLOCATION & PHRASAL VERB MATCHER */}
      {activeTab === 'matcher' && (
        <div className="max-w-4xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-[#12223a]/90 border border-[#A7C7E7]/25 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#A7C7E7]/20 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={tutorAvatarSrc}
                alt={tutorAvatarAlt}
                className="w-12 h-12 rounded-full bg-[#FAFAFA] p-1 shrink-0 object-contain shadow-md"
              />
              <div>
                <span className="font-montserrat font-bold text-xs text-[#E09B30] uppercase tracking-wider block">
                  {t.gamesView.tabMatcher}
                </span>
                <p className="font-inter text-xs text-[#A7C7E7]">
                  {t.gamesView.matcherDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#10b981]">
                {matchedIds.length} / {matchPairs.length} {isEs ? 'Emparejados' : 'Matched'}
              </span>
              <button
                type="button"
                onClick={handleResetMatcher}
                className="p-1.5 rounded-lg bg-[#1A3153] text-[#A7C7E7] hover:text-[#FAFAFA] cursor-pointer"
                title="Reset Matcher"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {matchedIds.length < matchPairs.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: English Terms */}
              <div className="space-y-3">
                <span className="text-xs font-montserrat font-bold text-[#A7C7E7] uppercase tracking-wider block">
                  1. {isEs ? 'Términos & Phrasal Verbs' : 'English Terms'}
                </span>
                {matchPairs.map((pair) => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isSelected = selectedTerm === pair.id;

                  return (
                    <button
                      key={pair.id}
                      type="button"
                      onClick={() => handleSelectTerm(pair.id)}
                      disabled={isMatched}
                      className={`w-full p-3.5 rounded-2xl border text-left font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isMatched
                          ? 'bg-[#10b981]/15 border-[#10b981]/30 text-[#10b981] opacity-60'
                          : isSelected
                          ? 'bg-[#E09B30] text-[#1A3153] border-[#E09B30] shadow-md scale-[1.01]'
                          : 'bg-[#1A3153] hover:bg-[#1A3153]/80 border-[#A7C7E7]/25 text-[#FAFAFA]'
                      }`}
                    >
                      <span>{pair.term}</span>
                      {isMatched && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Definitions */}
              <div className="space-y-3">
                <span className="text-xs font-montserrat font-bold text-[#A7C7E7] uppercase tracking-wider block">
                  2. {isEs ? 'Significados Pedagógicos' : 'Meanings'}
                </span>
                {matchPairs.map((pair) => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isSelected = selectedDefinition === pair.id;

                  return (
                    <button
                      key={pair.id}
                      type="button"
                      onClick={() => handleSelectDefinition(pair.id)}
                      disabled={isMatched}
                      className={`w-full p-3.5 rounded-2xl border text-left font-inter text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isMatched
                          ? 'bg-[#10b981]/15 border-[#10b981]/30 text-[#10b981] opacity-60'
                          : isSelected
                          ? 'bg-[#E09B30] text-[#1A3153] border-[#E09B30] shadow-md scale-[1.01]'
                          : 'bg-[#1A3153] hover:bg-[#1A3153]/80 border-[#A7C7E7]/25 text-[#A7C7E7]'
                      }`}
                    >
                      <span>{pair.definition}</span>
                      {isMatched && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] mx-auto">
                <Sparkles size={32} />
              </div>
              <h3 className="font-montserrat font-extrabold text-2xl text-[#FAFAFA]">
                {t.gamesView.allMatched}
              </h3>
              <p className="font-inter text-sm text-[#A7C7E7]">
                +75 XP • {isEs ? 'Completaste el emparejamiento con éxito.' : 'Pairs matched with high accuracy.'}
              </p>
              <button
                type="button"
                onClick={handleResetMatcher}
                className="py-3 px-6 rounded-full bg-[#1A3153] hover:bg-[#A7C7E7]/20 border border-[#A7C7E7]/30 text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-2 mx-auto cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{t.gamesView.playAgain}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: SENTENCE STRUCTURE BUILDER */}
      {activeTab === 'builder' && (
        <div className="max-w-3xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-[#12223a]/90 border border-[#A7C7E7]/25 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#A7C7E7]/20 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={tutorAvatarSrc}
                alt={tutorAvatarAlt}
                className="w-12 h-12 rounded-full bg-[#FAFAFA] p-1 shrink-0 object-contain shadow-md"
              />
              <div>
                <span className="font-montserrat font-bold text-xs text-[#E09B30] uppercase tracking-wider block">
                  {t.gamesView.tabBuilder} • {currentBuilderIndex + 1} / {builderChallenges.length}
                </span>
                <p className="font-inter text-xs text-[#A7C7E7]">
                  {currentChallenge.hint}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearBuilder}
              className="py-1 px-3 rounded-lg bg-[#1A3153] text-[#A7C7E7] hover:text-[#FAFAFA] text-xs font-semibold cursor-pointer"
            >
              {t.gamesView.resetSentence}
            </button>
          </div>

          {/* Target Slot Area */}
          <div className="min-h-[90px] p-4 rounded-2xl bg-[#1A3153]/70 border-2 border-dashed border-[#A7C7E7]/30 flex flex-wrap items-center gap-2">
            {selectedWords.length === 0 ? (
              <span className="text-xs text-[#A7C7E7]/60 italic">
                {isEs ? 'Toca las palabras abajo en orden para construir la oración...' : 'Tap the word pills below in order to build the sentence...'}
              </span>
            ) : (
              selectedWords.map((word, wIdx) => (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => handleRemoveWord(wIdx)}
                  className="px-3 py-1.5 rounded-xl bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs shadow-sm hover:bg-[#c88624] cursor-pointer"
                  title="Click to remove word"
                >
                  {word}
                </button>
              ))
            )}
          </div>

          {/* Shuffled Word Bank */}
          <div className="space-y-2">
            <span className="text-xs font-montserrat font-bold text-[#A7C7E7] uppercase tracking-wider block">
              {isEs ? 'Banco de Palabras:' : 'Word Bank:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {currentChallenge.shuffledWords.map((word, sIdx) => {
                // Check if word is already placed (counting duplicates properly)
                const countInShuffled = currentChallenge.shuffledWords.filter((w) => w === word).length;
                const countInSelected = selectedWords.filter((w) => w === word).length;
                const isUsed = countInSelected >= countInShuffled;

                return (
                  <button
                    key={sIdx}
                    type="button"
                    disabled={isUsed}
                    onClick={() => handleAddWord(word, sIdx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-semibold transition-all cursor-pointer ${
                      isUsed
                        ? 'opacity-25 bg-[#1A3153] text-[#A7C7E7] border border-transparent'
                        : 'bg-[#1A3153] hover:bg-[#E09B30] hover:text-[#1A3153] text-[#FAFAFA] border border-[#A7C7E7]/30 shadow-sm'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evaluation Banner */}
          {builderStatus === 'CORRECT' && (
            <div className="p-4 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/50 space-y-2 animate-in fade-in">
              <span className="font-montserrat font-bold text-xs text-[#10b981] flex items-center gap-1.5 uppercase">
                <CheckCircle2 size={16} />
                <span>{t.gamesView.sentenceComplete}</span>
              </span>
              <p className="font-inter text-xs text-[#FAFAFA]/90">
                {currentChallenge.pedagogicalTip}
              </p>
            </div>
          )}

          {builderStatus === 'WRONG' && (
            <div className="p-3 rounded-2xl bg-[#ef4444]/20 border border-[#ef4444]/40 text-xs text-[#FAFAFA] animate-in fade-in">
              {isEs
                ? 'El orden no es exacto aún. Revisa la posición de la cláusula y vuelve a intentar.'
                : 'The order is not quite right yet. Check clause positioning and retry.'}
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {builderStatus === 'CORRECT' ? (
              <button
                type="button"
                onClick={handleNextBuilder}
                className="py-2.5 px-6 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#1A3153] font-montserrat font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>{isEs ? 'Siguiente Desafío' : 'Next Challenge'}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCheckSentence}
                disabled={selectedWords.length !== currentChallenge.targetSentence.length}
                className="py-2.5 px-6 rounded-full bg-[#E09B30] hover:bg-[#c88624] disabled:opacity-40 text-[#1A3153] font-montserrat font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>{t.gamesView.checkSentence}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveGamesView;
