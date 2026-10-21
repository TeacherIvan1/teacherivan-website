import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Sparkles,
  CheckCircle2,
  Filter,
  Play,
  X,
  Clock,
  ArrowRight,
  Headphones,
  Check,
  AlertCircle,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useSprintStore } from '../modules/sprint/sprintStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';

export interface Collocation {
  term: string;
  definition: string;
  example: string;
}

export interface ReadingItem {
  id: string;
  title: string;
  level: 'A1–A2' | 'B1–B2' | 'IELTS / C1';
  scenario: 'Daily Routine' | 'Scholarship Interview' | 'Tech Job Interview' | 'IELTS Academic';
  readTime: string;
  summary: string;
  content: string[];
  collocations: Collocation[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ListeningItem {
  id: string;
  title: string;
  level: 'A1–A2' | 'B1–B2' | 'IELTS / C1';
  scenario: 'Daily Routine' | 'Scholarship Interview' | 'Tech Job Interview' | 'IELTS Academic';
  duration: string;
  tips: string[];
  transcriptExcerpt: string;
  keyVocab: string[];
}

export const EducationalResourcesView: React.FC = () => {
  const { t, isEs } = useTranslation();
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const { completedReadings, completedVideos, markReadingComplete, markVideoComplete } =
    useSprintStore();

  const [levelFilter, setLevelFilter] = useState<'ALL' | 'A1–A2' | 'B1–B2' | 'IELTS / C1'>('ALL');
  const [scenarioFilter, setScenarioFilter] = useState<string>('ALL');

  // Reader Modal State
  const [activeReading, setActiveReading] = useState<ReadingItem | null>(null);
  const [selectedCollocation, setSelectedCollocation] = useState<Collocation | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Listening Micro-Lesson Modal State
  const [activeListening, setActiveListening] = useState<ListeningItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const readings: ReadingItem[] = [
    {
      id: 'reading-1-routine',
      title: isEs ? 'Micro-Hábitos Matutinos y Cadencia Cognitiva' : 'Morning Micro-Habits & Cognitive Cadence',
      level: 'A1–A2',
      scenario: 'Daily Routine',
      readTime: '3 min',
      summary: isEs
        ? 'Aprende cómo apilar pequeños hábitos en inglés desde que te despiertas para reducir la fatiga de decisión.'
        : 'Discover how habit stacking early in the day reduces decision fatigue and keeps your English spontaneous.',
      content: [
        'Waking up thirty minutes earlier allows working professionals to establish high-focus micro-habits before email notifications begin.',
        'Rather than attempting an exhausting one-hour study marathon, neuroplastic research demonstrates that consistent ten-minute sprints facilitate automatic language retrieval.',
        'In the evening, taking time to wind down without blue light ensures deep restorative sleep and optimal memory consolidation.',
      ],
      collocations: [
        {
          term: 'habit stacking',
          definition: 'Attaching a new micro-habit onto an established daily routine.',
          example: 'I practice habit stacking by listening to English while brewing morning coffee.',
        },
        {
          term: 'wind down',
          definition: 'To gradually relax after a period of intense work or stress.',
          example: 'I usually wind down by reading an article rather than checking phone notifications.',
        },
        {
          term: 'cognitive load',
          definition: 'The total amount of mental effort being used in working memory.',
          example: 'Structured speaking routines reduce cognitive load during job interviews.',
        },
      ],
      questions: [
        {
          question: isEs
            ? '¿Qué ventaja destaca el texto sobre los micro-hábitos de 10 minutos frente a sesiones de una hora?'
            : 'What advantage does the text highlight regarding 10-minute micro-habits versus 1-hour sessions?',
          options: [
            isEs ? 'Son más costosos de mantener' : 'They are more expensive to maintain',
            isEs ? 'Facilitan la recuperación automática del idioma' : 'They facilitate automatic language retrieval',
            isEs ? 'Requieren más pantallas y distracciones' : 'They require more screens and distractions',
          ],
          correctIndex: 1,
          explanation: isEs
            ? 'La investigación neurolingüística confirma que la práctica diaria corta fija reflejos automáticos con mayor efectividad.'
            : 'Neurolinguistic research confirms consistent short daily practice builds automatic speaking reflexes more effectively.',
        },
        {
          question: isEs
            ? '¿Qué significa la colocación "wind down" en el contexto del artículo?'
            : 'What does the collocation "wind down" mean in this context?',
          options: [
            isEs ? 'Acelerar el ritmo de trabajo' : 'To accelerate work pace',
            isEs ? 'Relajarse gradualmente tras una jornada intensa' : 'To gradually relax after intense activity',
            isEs ? 'Comenzar un entrenamiento matutino' : 'To begin a morning workout',
          ],
          correctIndex: 1,
          explanation: isEs
            ? '"Wind down" es el phrasal verb para desacelerar y relajarse.'
            : '"Wind down" is the phrasal verb meaning to relax and transition into rest.',
        },
      ],
    },
    {
      id: 'reading-2-scholarship',
      title: isEs ? 'Defensa del Mérito Académico en Paneles de Beca' : 'Defending Academic Merit in Scholarship Panels',
      level: 'B1–B2',
      scenario: 'Scholarship Interview',
      readTime: '4 min',
      summary: isEs
        ? 'Estrategias para comunicar excelencia académica, liderazgo comunitario y visión de impacto.'
        : 'Techniques for articulating academic excellence, community leadership, and social impact before international panels.',
      content: [
        'International scholarship committees review thousands of standardized applications each cycle. The differentiating factor is rarely GPA alone; it is demonstrated leadership.',
        'When seeking competitive financial aid, candidates must demonstrate how their prospective degree will address urgent societal bottlenecks in their home regions.',
        'By highlighting proven academic merit and tangible community contributions, you convey conviction and international readiness.',
      ],
      collocations: [
        {
          term: 'academic merit',
          definition: 'Excellence demonstrated through grades, research, and scholarly achievements.',
          example: 'The scholarship was awarded strictly based on academic merit and leadership potential.',
        },
        {
          term: 'financial aid',
          definition: 'Grant, scholarship, or tuition funding to assist with educational expenses.',
          example: 'Without international financial aid, completing my graduate studies abroad would not be feasible.',
        },
        {
          term: 'demonstrated leadership',
          definition: 'Concrete past actions illustrating initiative, team direction, and responsibility.',
          example: 'Committees prioritize candidates with demonstrated leadership in social projects.',
        },
      ],
      questions: [
        {
          question: isEs
            ? 'Según el texto, ¿qué factor diferencia a los postulantes más allá del promedio de notas (GPA)?'
            : 'According to the text, what key factor differentiates applicants beyond GPA alone?',
          options: [
            isEs ? 'El número de horas libres' : 'The number of vacation hours',
            isEs ? 'El liderazgo demostrado en proyectos y comunidad' : 'Demonstrated leadership in projects and community',
            isEs ? 'La edad del postulante' : 'The age of the candidate',
          ],
          correctIndex: 1,
          explanation: isEs
            ? 'Los comités buscan impacto real y liderazgo más allá de las calificaciones teóricas.'
            : 'Selection committees prioritize authentic impact and leadership over purely theoretical test scores.',
        },
        {
          question: isEs
            ? '¿Cómo se debe articular la necesidad de "financial aid"?'
            : 'How should financial aid ambitions be framed?',
          options: [
            isEs ? 'Como un gasto sin retorno' : 'As an expense with no return',
            isEs ? 'Conectando el posgrado con la solución de problemas en la región de origen' : 'By linking the degree to solving critical bottlenecks in the home region',
            isEs ? 'Ocultando las metas profesionales' : 'By hiding long-term career aspirations',
          ],
          correctIndex: 1,
          explanation: isEs
            ? 'Conectar el apoyo financiero con el impacto futuro convence a los jurados.'
            : 'Demonstrating future social ROI is key to convincing international scholarship panels.',
        },
      ],
    },
    {
      id: 'reading-3-tech',
      title: isEs ? 'Trade-Offs de Escalabilidad en Sistemas Distribuidos' : 'Scalability Trade-Offs in Distributed Systems',
      level: 'B1–B2',
      scenario: 'Tech Job Interview',
      readTime: '4 min',
      summary: isEs
        ? 'Vocabulario de ingeniería para debatir consistencia eventual, microservicios y cuellos de botella en entrevistas de software.'
        : 'Engineering vocabulary for discussing eventual consistency, microservices, and system constraints in senior interviews.',
      content: [
        'During technical system design rounds, senior engineers are not evaluated on finding one perfect answer, but on articulating key trade-offs.',
        'When architecting for high availability, prioritizing immediate scalability often requires embracing eventual consistency across distributed database replicas.',
        'Identifying the primary scalability bottleneck early in the conversation reassures the interviewer that you understand real-world production risks.',
      ],
      collocations: [
        {
          term: 'key trade-off',
          definition: 'A strategic compromise where one desirable quality is sacrificed to gain another.',
          example: 'We accepted latency as a key trade-off to ensure complete data consistency.',
        },
        {
          term: 'scalability bottleneck',
          definition: 'A point of congestion that prevents a technical architecture from growing seamlessly.',
          example: 'The unindexed relational database became our primary scalability bottleneck.',
        },
        {
          term: 'eventual consistency',
          definition: 'A distributed systems model where all replicas eventually converge to the same data.',
          example: 'Our distributed cache uses eventual consistency to maintain millisecond response times.',
        },
      ],
      questions: [
        {
          question: isEs
            ? '¿En qué se enfoca la evaluación técnica de arquitectura según el texto?'
            : 'What is the primary focus of senior system design interviews according to the text?',
          options: [
            isEs ? 'En memorizar comandos de terminal' : 'Memorizing terminal commands',
            isEs ? 'En articular los trade-offs de diseño con claridad' : 'Articulating architectural trade-offs clearly',
            isEs ? 'En ignorar la escalabilidad' : 'Ignoring scalability concerns',
          ],
          correctIndex: 1,
          explanation: isEs
            ? 'En ingeniería sénior, no existe solución perfecta: comunicar los pros y contras define la contratación.'
            : 'Senior engineering interviewers value nuanced trade-off articulation over superficial dogma.',
        },
        {
          question: isEs
            ? '¿Qué implica adoptar "eventual consistency" en un sistema distribuido?'
            : 'What does adopting "eventual consistency" imply in a distributed system?',
          options: [
            isEs ? 'Que los datos nunca se sincronizan' : 'That data will never synchronize',
            isEs ? 'Que todas las réplicas convergen al mismo estado con el tiempo' : 'That all database replicas converge to the same state over time',
            isEs ? 'Que no se necesita base de datos' : 'That databases are not necessary',
          ],
          correctIndex: 1,
          explanation: isEs
            ? 'La consistencia eventual asegura que las réplicas se actualicen de manera asíncrona sin bloquear lecturas.'
            : 'Eventual consistency allows asynchronous replication without blocking low-latency reads.',
        },
      ],
    },
    {
      id: 'reading-4-ielts',
      title: isEs ? 'IELTS Academic: Cohesión Avanzada y Parafraseo' : 'IELTS Academic: Advanced Cohesion & Paraphrasing',
      level: 'IELTS / C1',
      scenario: 'IELTS Academic',
      readTime: '5 min',
      summary: isEs
        ? 'Estructuras de Banda 7.5+ para presentar argumentos convincentes y evitar vocabulario repetitivo.'
        : 'Band 7.5+ discourse markers and lexical precision to construct nuanced, cohesive arguments.',
      content: [
        'To secure a Band 7.5 or higher on the IELTS Speaking and Writing examinations, test-takers must transcend formulaic connectors such as "furthermore" and "in addition".',
        'Examiners look for spontaneous use of counter-intuitive observations and varied sentence structures, such as inversion and participle clauses.',
        'Formulating a compelling argument requires framing multifaceted topics—such as socioeconomic disparity and technological disruption—with balanced nuance.',
      ],
      collocations: [
        {
          term: 'compelling argument',
          definition: 'A persuasive, well-supported point that demands attention and agreement.',
          example: 'The candidate constructed a compelling argument regarding the economic viability of green energy.',
        },
        {
          term: 'counter-intuitive',
          definition: 'Contrary to what common sense or initial intuition would suggest.',
          example: 'It seems counter-intuitive, but speaking slightly slower significantly improves perceived fluency.',
        },
        {
          term: 'socioeconomic disparity',
          definition: 'Inequality between groups regarding wealth, education, and social opportunities.',
          example: 'Targeted scholarship initiatives directly address long-standing socioeconomic disparity.',
        },
      ],
      questions: [
        {
          question: isEs
            ? '¿Qué recomienda el texto para alcanzar Banda 7.5 o superior en IELTS?'
            : 'What does the text recommend to achieve Band 7.5+ in IELTS Speaking?',
          options: [
            isEs ? 'Repetir conectores básicos como "in addition"' : 'Repeatedly using basic connectors like "in addition"',
            isEs ? 'Utilizar variedad estructural y matices argumentativos espontáneos' : 'Employing structural variety and spontaneous nuanced argumentation',
            isEs ? 'Hablar lo más rápido posible sin pausas' : 'Speaking as fast as possible without pauses',
          ],
          correctIndex: 1,
          explanation: isEs
            ? 'Los examinadores de IELTS valoran la precisión léxica y la variedad de estructuras sintácticas complejas.'
            : 'IELTS examiners reward natural lexical precision and advanced syntactic flexibility over mechanical speed.',
        },
        {
          question: isEs
            ? '¿Qué significa la palabra "counter-intuitive"?'
            : 'What does "counter-intuitive" mean in English?',
          options: [
            isEs ? 'Algo obvio que todo el mundo sabe' : 'Something obvious that everyone knows',
            isEs ? 'Algo que va en contra de lo que la intuición inicial sugiere' : 'Something contrary to what initial intuition suggests',
            isEs ? 'Un error gramatical irreparable' : 'An irreparable grammatical error',
          ],
          correctIndex: 1,
          explanation: isEs
            ? '"Counter-intuitive" describe hechos válidos que al principio parecen contrarios a la lógica común.'
            : '"Counter-intuitive" describes valid phenomena that run opposite to superficial expectations.',
        },
      ],
    },
  ];

  const listenings: ListeningItem[] = [
    {
      id: 'listen-1-pitch',
      title: isEs ? 'El Elevator Pitch de 90 Segundos para Profesionales' : 'Mastering the 90-Second Tech Pitch',
      level: 'B1–B2',
      scenario: 'Tech Job Interview',
      duration: '3:20 min',
      tips: [
        isEs ? 'Hook inicial en 10s: Menciona tu impacto principal antes de enumerar tecnologías.' : '10s Hook: State your main impact before listing programming languages.',
        isEs ? 'Evita el efecto lista: Narra un desafío resuelto con datos cuantificables.' : 'Avoid the grocery-list effect: Frame your experience around a solved challenge.',
        isEs ? 'Cierra con tu objetivo de crecimiento y valor para la empresa.' : 'Close with your prospective contribution to their team objectives.',
      ],
      transcriptExcerpt:
        '“Over the past four years, I have architected high-throughput APIs serving over one hundred thousand active users. What drives my work is eliminating latency bottlenecks and collaborating directly with cross-functional product teams...”',
      keyVocab: ['High-throughput', 'Cross-functional', 'Latency bottlenecks', 'Key deliverables'],
    },
    {
      id: 'listen-2-star',
      title: isEs ? 'Preguntas de Conducta: El Método STAR en Acción' : 'Behavioral Interviews: STAR Method in Action',
      level: 'B1–B2',
      scenario: 'Scholarship Interview',
      duration: '4:15 min',
      tips: [
        isEs ? 'Situation & Task (25% del tiempo): Establece el contexto y la meta con claridad.' : 'Situation & Task (25% time): Establish context and target cleanly.',
        isEs ? 'Action (50% del tiempo): Usa verbos activos en primera persona ("I coordinated", "I restructured").' : 'Action (50% time): Use active first-person verbs ("I coordinated", "I designed").',
        isEs ? 'Result (25% del tiempo): Termina con el impacto medible y tu lección aprendida.' : 'Result (25% time): Conclude with quantifiable impact and key takeaway.',
      ],
      transcriptExcerpt:
        '“When our community project faced a fifty percent funding reduction, I took the initiative to restructure our logistics and partner with local universities. As a direct result, we maintained our outreach program without canceling a single workshop...”',
      keyVocab: ['Take the initiative', 'Restructure logistics', 'Community outreach', 'Quantifiable outcome'],
    },
    {
      id: 'listen-3-reductions',
      title: isEs ? 'Connected Speech y Reducciones Acústicas Nativas' : 'Connected Speech & Acoustic Reductions',
      level: 'A1–A2',
      scenario: 'Daily Routine',
      duration: '2:50 min',
      tips: [
        isEs ? 'Los nativos no hablan más rápido: enlazan consonantes con vocales ("hold on" -> /hol-don/).' : 'Natives don’t speak faster: they link final consonants to initial vowels.',
        isEs ? 'Identifica formas débiles: "and" se reduce a /ən/, "to" se reduce a /tə/.' : 'Identify weak forms: "and" reduces to /ən/, "to" reduces to /tə/.',
        isEs ? 'Flujo rítmico: Acentúa solo sustantivos, verbos y adjetivos principales.' : 'Stress timing: Place acoustic weight on content words, glide over function words.',
      ],
      transcriptExcerpt:
        '“Could you pass me that report? /kʊdʒuː pæs miː ðæt rɪpɔːrt/ — Notice how ‘could’ and ‘you’ merge seamlessly into /kʊdʒuː/ without a hard stop.”',
      keyVocab: ['Connected speech', 'Acoustic assimilation', 'Weak forms', 'Rhythmic pacing'],
    },
    {
      id: 'listen-4-ielts',
      title: isEs ? 'Precisión Léxica y Parafraseo para IELTS 7.5+' : 'Lexical Resource & Nuance for IELTS 7.5+',
      level: 'IELTS / C1',
      scenario: 'IELTS Academic',
      duration: '4:45 min',
      tips: [
        isEs ? 'Evita muletillas vagas: sustituye "good/bad" por adjetivos de alta precisión ("beneficial", "detrimental").' : 'Eliminate vague adjectives: replace "good/bad" with "beneficial", "detrimental".',
        isEs ? 'Usa colocaciones nativas: "pose a threat", "shed light on", "wreak havoc".' : 'Deploy idiomatic collocations naturally: "pose a threat", "shed light on".',
        isEs ? 'Modula el grado de certeza: usa adverbios de probabilidad ("arguably", "predominantly").' : 'Hedge your claims with adverbs: "arguably", "predominantly", "invariably".',
      ],
      transcriptExcerpt:
        '“While urban density arguably poses infrastructure challenges, it predominantly fosters technological innovation and resource efficiency when managed with long-term strategic foresight...”',
      keyVocab: ['Arguably', 'Shed light on', 'Resource efficiency', 'Strategic foresight'],
    },
  ];

  // Pronunciation via browser SpeechSynthesis
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSimulateListeningAudio = (item: ListeningItem) => {
    setIsPlayingAudio(true);
    handleSpeak(item.transcriptExcerpt);
    setTimeout(() => setIsPlayingAudio(false), 6000);
  };

  const filteredReadings = readings.filter((r) => {
    if (levelFilter !== 'ALL' && r.level !== levelFilter) return false;
    if (scenarioFilter !== 'ALL' && r.scenario !== scenarioFilter) return false;
    return true;
  });

  const filteredListenings = listenings.filter((l) => {
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false;
    if (scenarioFilter !== 'ALL' && l.scenario !== scenarioFilter) return false;
    return true;
  });

  const handleFinishReading = (readingId: string) => {
    markReadingComplete(readingId);
    setActiveReading(null);
  };

  const handleFinishListening = (listeningId: string) => {
    markVideoComplete(listeningId);
    setActiveListening(null);
  };

  return (
    <div id="educational-resources-view" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-10 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
          <BookOpen size={14} />
          <span>{t.resourcesView.badge}</span>
        </div>
        <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
          {t.resourcesView.title}
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
          {t.resourcesView.subtitle}
        </p>
      </div>

      {/* Quick-Access Card: 1-on-1 Class Scheduling with Teacher Ivan */}
      <div
        id="quick-book-class-card"
        className="p-6 rounded-3xl bg-gradient-to-r from-[#12223a] via-[#1A3153] to-[#12223a] border-2 border-[#E09B30]/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5"
      >
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09B30]/20 text-[#E09B30] text-xs font-montserrat font-bold">
            <Calendar size={14} />
            <span>{t.scheduling.quickBookCardTitle}</span>
          </div>
          <p className="font-inter text-xs text-[#FAFAFA] max-w-2xl leading-relaxed">
            {t.scheduling.quickBookCardDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveView('schedule')}
          className="shrink-0 px-6 py-3.5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all shadow-lg shadow-[#E09B30]/30 cursor-pointer flex items-center gap-2"
        >
          <Calendar size={14} />
          <span>{t.scheduling.quickBookBtn}</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="p-4 rounded-3xl bg-[#12223a]/90 border border-[#A7C7E7]/25 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        {/* CEFR Level Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-montserrat font-bold text-[#A7C7E7] flex items-center gap-1.5 uppercase tracking-wider">
            <Filter size={14} className="text-[#E09B30]" />
            <span>{t.resourcesView.level}:</span>
          </span>

          {(['ALL', 'A1–A2', 'B1–B2', 'IELTS / C1'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                levelFilter === lvl
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                  : 'bg-[#1A3153] text-[#A7C7E7] hover:text-[#FAFAFA] border border-[#A7C7E7]/20'
              }`}
            >
              {lvl === 'ALL' ? t.resourcesView.filterAllLevels : lvl}
            </button>
          ))}
        </div>

        {/* Scenario Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-montserrat font-bold text-[#A7C7E7] uppercase tracking-wider">
            {t.resourcesView.scenario}:
          </span>
          <select
            value={scenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs bg-[#1A3153] border border-[#A7C7E7]/30 text-[#FAFAFA] font-medium focus:outline-none focus:border-[#E09B30]"
          >
            <option value="ALL">{t.resourcesView.filterAllScenarios}</option>
            <option value="Daily Routine">Daily Routine</option>
            <option value="Scholarship Interview">Scholarship Interview</option>
            <option value="Tech Job Interview">Tech Job Interview</option>
            <option value="IELTS Academic">IELTS Academic</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE READINGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#FAFAFA] flex items-center gap-2.5">
              <BookOpen size={22} className="text-[#E09B30]" />
              <span>{t.resourcesView.readingsTitle}</span>
            </h2>
            <p className="font-inter text-xs sm:text-sm text-[#A7C7E7]">
              {t.resourcesView.readingsSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReadings.map((reading) => {
            const isCompleted = completedReadings.includes(reading.id);

            return (
              <div
                key={reading.id}
                className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-gradient-to-b from-[#1A3153] to-[#12223a] border-[#10b981]/40 shadow-md'
                    : 'bg-[#1A3153]/70 border-[#A7C7E7]/25 hover:border-[#A7C7E7]/50 shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E09B30]/15 text-[#E09B30] text-[11px] font-montserrat font-bold uppercase tracking-wider">
                        {reading.level}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#A7C7E7]/15 text-[#A7C7E7] text-[11px] font-semibold">
                        {reading.scenario}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-xs text-[#A7C7E7]">
                      <Clock size={12} />
                      <span>{reading.readTime}</span>
                    </span>
                  </div>

                  <h3 className="font-montserrat font-bold text-lg text-[#FAFAFA] mb-2 leading-snug">
                    {reading.title}
                  </h3>
                  <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] leading-relaxed mb-4">
                    {reading.summary}
                  </p>

                  {/* Collocation pills preview */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {reading.collocations.map((col) => (
                      <span
                        key={col.term}
                        className="px-2.5 py-1 rounded-full bg-[#FAFAFA]/10 text-xs font-mono text-[#E09B30]"
                      >
                        {col.term}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#A7C7E7]/15">
                  {isCompleted ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#10b981]">
                      <CheckCircle2 size={16} />
                      <span>{t.resourcesView.completedBadge}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-[#A7C7E7]">+40 XP</span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveReading(reading);
                      setSelectedCollocation(null);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="py-2 px-4 rounded-full bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{t.resourcesView.startReading}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MULTIMEDIA & LISTENING MICRO-LESSONS */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#FAFAFA] flex items-center gap-2.5">
            <Headphones size={22} className="text-[#E09B30]" />
            <span>{t.resourcesView.listeningsTitle}</span>
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7]">
            {t.resourcesView.listeningsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredListenings.map((item) => {
            const isCompleted = completedVideos.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-gradient-to-b from-[#1A3153] to-[#12223a] border-[#10b981]/40 shadow-md'
                    : 'bg-[#1A3153]/70 border-[#A7C7E7]/25 hover:border-[#A7C7E7]/50 shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E09B30]/15 text-[#E09B30] text-[11px] font-montserrat font-bold uppercase tracking-wider">
                        {item.level}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#A7C7E7]/15 text-[#A7C7E7] text-[11px] font-semibold">
                        {item.scenario}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-xs text-[#A7C7E7]">
                      <Clock size={12} />
                      <span>{item.duration}</span>
                    </span>
                  </div>

                  <h3 className="font-montserrat font-bold text-lg text-[#FAFAFA] mb-3 leading-snug">
                    {item.title}
                  </h3>

                  <ul className="space-y-1.5 mb-4 text-xs font-inter text-[#A7C7E7]">
                    {item.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#E09B30] font-bold mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Key Vocab pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {item.keyVocab.map((vocab) => (
                      <span
                        key={vocab}
                        className="px-2 py-0.5 rounded-full bg-[#FAFAFA]/10 text-xs font-mono text-[#A7C7E7]"
                      >
                        {vocab}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#A7C7E7]/15">
                  {isCompleted ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#10b981]">
                      <CheckCircle2 size={16} />
                      <span>{t.resourcesView.completedBadge}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-[#A7C7E7]">+40 XP</span>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveListening(item)}
                    className="py-2 px-4 rounded-full bg-[#1A3153] hover:bg-[#E09B30] hover:text-[#1A3153] text-[#A7C7E7] border border-[#A7C7E7]/30 font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>{t.resourcesView.startListening}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* READING VIEWER MODAL */}
      {activeReading && (
        <div
          id="reading-viewer-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#1A3153]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl bg-[#12223a] border-2 border-[#E09B30]/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-[#FAFAFA] flex flex-col gap-6 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#A7C7E7]/20 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E09B30]/15 text-[#E09B30] text-[11px] font-montserrat font-bold uppercase tracking-wider">
                    {activeReading.level}
                  </span>
                  <span className="text-xs text-[#A7C7E7]">{activeReading.scenario}</span>
                </div>
                <h2 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#FAFAFA]">
                  {activeReading.title}
                </h2>
              </div>

              <button
                onClick={() => setActiveReading(null)}
                className="p-2 rounded-full bg-[#1A3153] hover:bg-[#A7C7E7]/20 text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Reading Content with Interactive Collocation Highlights */}
            <div className="space-y-4 font-inter text-sm sm:text-base leading-relaxed text-[#FAFAFA]/95 bg-[#1A3153]/40 p-5 rounded-2xl border border-[#A7C7E7]/20">
              {activeReading.content.map((paragraph, pIdx) => {
                // Highlight collocations in text
                let highlighted = paragraph;
                return (
                  <p key={pIdx}>
                    {activeReading.collocations.reduce<React.ReactNode[]>((acc, col, cIdx) => {
                      // Render paragraph with clickable collocation tokens
                      return [paragraph];
                    }, [])}
                  </p>
                );
              })}
            </div>

            {/* Interactive Target Collocations Bar */}
            <div className="p-4 rounded-2xl bg-[#1A3153]/70 border border-[#E09B30]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#E09B30] flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>{t.resourcesView.targetCollocations}</span>
                </span>
                <span className="text-[11px] text-[#A7C7E7]">
                  {t.resourcesView.clickToPronounce}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeReading.collocations.map((col) => (
                  <button
                    key={col.term}
                    type="button"
                    onClick={() => {
                      setSelectedCollocation(col);
                      handleSpeak(col.term);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedCollocation?.term === col.term
                        ? 'bg-[#E09B30]/20 border-[#E09B30] text-[#FAFAFA]'
                        : 'bg-[#12223a]/80 border-[#A7C7E7]/20 hover:border-[#E09B30]/50 text-[#A7C7E7]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-xs text-[#E09B30]">
                        {col.term}
                      </span>
                      <Volume2 size={14} className="text-[#A7C7E7] hover:text-[#FAFAFA]" />
                    </div>
                    <span className="text-[11px] text-[#FAFAFA]/80 line-clamp-2">
                      {col.definition}
                    </span>
                  </button>
                ))}
              </div>

              {selectedCollocation && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#12223a] border border-[#E09B30]/40 text-xs text-[#FAFAFA] space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E09B30]">
                      "{selectedCollocation.term}" — Contextual Usage
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(selectedCollocation.example)}
                      className="text-[11px] text-[#A7C7E7] hover:text-[#FAFAFA] flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 size={12} />
                      <span>{t.resourcesView.listenPronunciation}</span>
                    </button>
                  </div>
                  <p className="font-inter italic text-[#A7C7E7]">
                    "{selectedCollocation.example}"
                  </p>
                </div>
              )}
            </div>

            {/* Comprehension Check */}
            <div className="space-y-4 pt-2 border-t border-[#A7C7E7]/20">
              <h3 className="font-montserrat font-bold text-sm text-[#FAFAFA] uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={16} className="text-[#E09B30]" />
                <span>{t.resourcesView.comprehensionCheck}</span>
              </h3>

              {activeReading.questions.map((q, qIdx) => {
                const selectedOpt = quizAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                return (
                  <div key={qIdx} className="p-4 rounded-2xl bg-[#1A3153]/50 border border-[#A7C7E7]/20 space-y-2.5">
                    <p className="font-inter text-xs sm:text-sm font-semibold text-[#FAFAFA]">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                            setQuizSubmitted(true);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-inter transition-all cursor-pointer ${
                            selectedOpt === optIdx
                              ? optIdx === q.correctIndex
                                ? 'bg-[#10b981]/25 border border-[#10b981] text-[#FAFAFA]'
                                : 'bg-[#ef4444]/25 border border-[#ef4444] text-[#FAFAFA]'
                              : 'bg-[#12223a]/60 hover:bg-[#FAFAFA]/5 text-[#A7C7E7] border border-[#A7C7E7]/15'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {isAnswered && (
                      <p
                        className={`text-[11px] font-medium pt-1 ${
                          isCorrect ? 'text-[#10b981]' : 'text-[#f59e0b]'
                        }`}
                      >
                        {isCorrect ? t.resourcesView.correctAnswer : t.resourcesView.incorrectAnswer}{' '}
                        • {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#A7C7E7]/20">
              <button
                type="button"
                onClick={() => setActiveReading(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-montserrat font-bold text-[#A7C7E7] hover:text-[#FAFAFA] cursor-pointer"
              >
                {t.resourcesView.closeModal}
              </button>

              <button
                type="button"
                onClick={() => handleFinishReading(activeReading.id)}
                className="py-2.5 px-6 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#1A3153] font-montserrat font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Check size={16} />
                <span>{t.resourcesView.markAsCompleted}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LISTENING MICRO-LESSON MODAL */}
      {activeListening && (
        <div
          id="listening-viewer-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#1A3153]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-[#12223a] border-2 border-[#E09B30]/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-[#FAFAFA] flex flex-col gap-6 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#A7C7E7]/20 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E09B30]/15 text-[#E09B30] text-[11px] font-montserrat font-bold uppercase tracking-wider">
                    {activeListening.level}
                  </span>
                  <span className="text-xs text-[#A7C7E7]">{activeListening.duration}</span>
                </div>
                <h2 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#FAFAFA]">
                  {activeListening.title}
                </h2>
              </div>

              <button
                onClick={() => setActiveListening(null)}
                className="p-2 rounded-full bg-[#1A3153] hover:bg-[#A7C7E7]/20 text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Audio Player Simulator */}
            <div className="p-5 rounded-2xl bg-[#1A3153]/70 border border-[#E09B30]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSimulateListeningAudio(activeListening)}
                  className="w-12 h-12 rounded-full bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <Play size={20} fill="currentColor" />
                </button>
                <div>
                  <span className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA] block">
                    {t.resourcesView.audioSimulated}
                  </span>
                  <span className="text-[11px] text-[#A7C7E7]">
                    {isPlayingAudio ? 'Reproduciendo audio nativo...' : 'Toca para escuchar el extracto nativo'}
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs text-[#E09B30]">{activeListening.duration}</span>
            </div>

            {/* Transcript Highlight Excerpt */}
            <div className="p-4 rounded-2xl bg-[#1A3153]/50 border border-[#A7C7E7]/20 space-y-2">
              <span className="text-[11px] font-montserrat font-bold text-[#E09B30] uppercase tracking-wider block">
                Extracto de Audio & Transcripción
              </span>
              <p className="font-inter text-xs sm:text-sm text-[#FAFAFA]/90 italic leading-relaxed">
                {activeListening.transcriptExcerpt}
              </p>
            </div>

            {/* Key Vocabulary Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-montserrat font-bold text-[#A7C7E7] uppercase tracking-wider block">
                Vocabulario Clave para tu Práctica
              </span>
              <div className="flex flex-wrap gap-2">
                {activeListening.keyVocab.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleSpeak(v)}
                    className="px-3 py-1.5 rounded-full bg-[#1A3153] border border-[#A7C7E7]/30 text-xs font-mono text-[#FAFAFA] hover:border-[#E09B30] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 size={12} className="text-[#E09B30]" />
                    <span>{v}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#A7C7E7]/20">
              <button
                type="button"
                onClick={() => setActiveListening(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-montserrat font-bold text-[#A7C7E7] hover:text-[#FAFAFA] cursor-pointer"
              >
                {t.resourcesView.closeModal}
              </button>

              <button
                type="button"
                onClick={() => handleFinishListening(activeListening.id)}
                className="py-2.5 px-6 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#1A3153] font-montserrat font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Check size={16} />
                <span>{t.resourcesView.markAsCompleted}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalResourcesView;
