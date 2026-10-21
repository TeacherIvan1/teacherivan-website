import { GoogleGenAI } from '@google/genai';
import type { LearningGoals } from './userStore.js';
export type { LearningGoals };

export interface SprintDay {
  day: 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
  type: 'Receptive Input' | 'Structural Processing' | 'Async Oral Production' | 'Functional Writing Prompt' | 'Weekly Closure';
  title: string;
  time: string;
  description: string;
  targetCollocations: string[];
  simulatorScenarioPreset: string;
  functionalWritingPrompt?: string;
  highlight: string;
}

export interface GeneratedSprint {
  targetLevel: string;
  primaryGoal: string;
  focusSkill: string;
  personalObjective: string;
  days: SprintDay[];
  generatedBy: 'gemini' | 'deterministic-fallback';
  modelUsed?: string;
}

/**
 * Deterministic goal-based sprint generator ensuring instant, 100% reliable 
 * fallback with zero downtime or rate limit failure.
 */
export function getDeterministicSprint(goals: LearningGoals): GeneratedSprint {
  const { targetLevel, primaryGoal, focusSkill, personalObjective } = goals;

  switch (primaryGoal) {
    case 'Tech & Job Interviews':
      return {
        targetLevel,
        primaryGoal,
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Technical Narrative & Behavioral Analysis',
            time: '10–12 min',
            description: `Listen to a Silicon Valley interview breakdown on articulating engineering trade-offs and leadership principles. Focus: ${focusSkill}.`,
            targetCollocations: ['architectural trade-offs', 'drive consensus', 'scalability bottleneck', 'cross-functional alignment'],
            simulatorScenarioPreset: 'Tech Lead Behavioral Interview',
            highlight: 'Identify 4 high-impact verbs used to describe incident resolution.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'STAR Method Syntax & Past-Present Perfect Framing',
            time: '12–15 min',
            description: 'Master seamless transitions between past narrative (Situation/Task) and quantifiable present impact (Result).',
            targetCollocations: ['spearheaded the migration', 'subsequently reduced latency by', 'mitigated single points of failure'],
            simulatorScenarioPreset: 'System Design Justification',
            highlight: 'Formulate 3 STAR narrative responses using contrasting past tenses.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: "Tell Me About a System Conflict"',
            time: '10–15 min',
            description: 'Record a 90-second voice note detailing how you resolved a high-stakes technical disagreement. Receive audio recasting from Teacher Ivan.',
            targetCollocations: ['differing technical perspectives', 'data-backed compromise', 'post-mortem takeaways'],
            simulatorScenarioPreset: 'Conflict & Collaboration Simulation',
            highlight: 'Submit voice note on WhatsApp; receive acoustic and phonological recast within 24h.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'Executive Follow-Up & Portfolio Pitch',
            time: '15–20 min',
            description: `Draft an executive email synthesis addressing: "${personalObjective}". Anchor your technical value proposition.`,
            targetCollocations: ['thank you for the thoughtful discussion', 'further elaborating on our discussion regarding', 'key technical deliverables'],
            simulatorScenarioPreset: 'Post-Interview Thank You & Value Add',
            functionalWritingPrompt: `Write a 120-word professional follow-up email to the Hiring Committee specifically addressing your personal target: "${personalObjective}". Highlight one system bottleneck you discussed, propose an actionable solution with 2 collocations, and reaffirm your enthusiasm.`,
            highlight: 'Teacher Ivan provides written syntactic critique with CEFR band alignment.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Live AI Simulation & Metric Calibration',
            time: '10–15 min',
            description: 'Engage in a live interactive voice round with Emma simulating a Principal Engineer probing your career history.',
            targetCollocations: ['in retrospect', 'key architectural takeaway', 'strategic long-term vision'],
            simulatorScenarioPreset: 'Executive Engineering Final Round',
            highlight: 'Complete 3 turns to generate your comprehensive CEFR progress report.',
          },
        ],
      };

    case 'University Scholarship':
      return {
        targetLevel,
        primaryGoal,
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Academic Statement & Purpose Dissection',
            time: '10–12 min',
            description: `Listen to Chevening & Fulbright alumni interviews breaking down community impact narratives. Focus on ${focusSkill}.`,
            targetCollocations: ['socioeconomic catalyst', 'scholarly rigor', 'sustainable development initiative', 'transformative potential'],
            simulatorScenarioPreset: 'Scholarship Committee Screening',
            highlight: 'Extract 3 rhetorical markers used to bridge academic theory and local impact.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'Causal Connectors & Conditional Vision Framing',
            time: '12–15 min',
            description: 'Master complex conditional structures ("Had I not encountered..., I would not have pioneered...").',
            targetCollocations: ['integral to my long-term vision', 'fostering regional resilience', 'bridging systemic disparities'],
            simulatorScenarioPreset: 'Academic Panel Q&A',
            highlight: 'Synthesize your research purpose into 2 complex compound sentences.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: "Why You Deserve This Fellowship"',
            time: '10–15 min',
            description: 'Record a 90-second voice pitch articulating your personal leadership trajectory and dedication to your country.',
            targetCollocations: ['committed to reinvesting knowledge', 'catalyzing grassroots reform', 'interdisciplinary approach'],
            simulatorScenarioPreset: 'Scholarship Interview Panel',
            highlight: 'WhatsApp submission with personalized phonetic stress recast from Teacher Ivan.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'Academic Motivation Essay Excerpt',
            time: '15–20 min',
            description: `Craft an academic statement of intent directly addressing: "${personalObjective}".`,
            targetCollocations: ['my scholarly trajectory', 'compelling imperative', 'actionable roadmap'],
            simulatorScenarioPreset: 'Admissions & Grant Review',
            functionalWritingPrompt: `Write a 150-word scholarship motivation paragraph tailored to your goal: "${personalObjective}". Explicitly explain how this opportunity will empower you to create sustainable impact in your field, using at least 3 academic collocations.`,
            highlight: 'Receive formal academic register critique and lexical precision feedback.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Live Panel Simulation & CEFR Diagnostic',
            time: '10–15 min',
            description: 'Live voice defense with Tutor Emma acting as Chair of the International Scholarship Board.',
            targetCollocations: ['policy implementation', 'demonstrable community impact', 'scholarly contribution'],
            simulatorScenarioPreset: 'Scholarship Board Final Defense',
            highlight: 'Earn your weekly CEFR competency certificate and WPM speaking cadence score.',
          },
        ],
      };

    case 'IELTS Exam Prep':
      return {
        targetLevel,
        primaryGoal,
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Band 8+ Speaking & Academic Discourse Analysis',
            time: '10–12 min',
            description: `Analyze authentic Part 2 & Part 3 candidate samples showcasing discourse markers and lexical flexibility. Focus: ${focusSkill}.`,
            targetCollocations: ['far-reaching ramifications', 'predominant contributing factor', 'a contentious debate', 'markedly distinct'],
            simulatorScenarioPreset: 'IELTS Examiner Part 3 Simulation',
            highlight: 'Note how Band 8.5 speakers buy thinking time with academic discourse hedges.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'Complex Inversion & Passive Cleft Sentences',
            time: '12–15 min',
            description: 'Practice high-band grammatical structures: "Not only does it exacerbate...", "What remains paramount is...".',
            targetCollocations: ['seldom do we observe', 'it is widely contended that', 'under no circumstances should'],
            simulatorScenarioPreset: 'Grammatical Range Drill',
            highlight: 'Transform 3 standard sentences into inverted academic constructions.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: IELTS Speaking Part 2 Cue Card',
            time: '10–15 min',
            description: 'Speak for a full 2 minutes on an unfamiliar topic cue card with 1 minute prep time.',
            targetCollocations: ['vividly recollect', 'pivotal turning point', 'profoundly influenced my outlook'],
            simulatorScenarioPreset: 'IELTS Part 2 Long Turn',
            highlight: 'Teacher Ivan calculates speech continuity, pause frequency, and phonological rhythm.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'Task 2 Essay Introduction & Thesis Framing',
            time: '15–20 min',
            description: `Write a compelling Band 8 intro and thesis targeting: "${personalObjective}".`,
            targetCollocations: ['while it is often argued that', 'I firmly maintain that', 'merits rigorous examination'],
            simulatorScenarioPreset: 'IELTS Academic Writing Task 2',
            functionalWritingPrompt: `Write an IELTS Task 2 introduction and topic sentence (75 words) focused on your milestone: "${personalObjective}". State opposing views succinctly and present a clear, nuanced personal stance with 2 advanced cohesive devices.`,
            highlight: 'Examiner-level assessment across Coherence, Lexical Resource, and Grammatical Range.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Full IELTS Speaking Part 3 Mock with Emma',
            time: '10–15 min',
            description: 'Abstract debate on global socioeconomic trends with rapid follow-up probing questions.',
            targetCollocations: ['inextricably linked', 'speculative projection', 'substantiate this claim'],
            simulatorScenarioPreset: 'IELTS Speaking Part 3 Deep Dive',
            highlight: 'Receive full CEFR/IELTS Band estimate (e.g. 6.5, 7.0, 7.5) with target correction notes.',
          },
        ],
      };

    case 'Business & Executive English':
      return {
        targetLevel,
        primaryGoal,
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Boardroom Negotiations & Diplomatic Pushback',
            time: '10–12 min',
            description: `Deconstruct C-suite negotiations analyzing tactful disagreements and stakeholder alignment. Focus: ${focusSkill}.`,
            targetCollocations: ['strategic imperatives', 'manage stakeholder expectations', 'commercial viability', 'synergistic alignment'],
            simulatorScenarioPreset: 'Executive Board Meeting',
            highlight: 'Spot 4 modal hedges used to assert authority diplomatically.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'Diplomatic Recasting & Persuasive Framing',
            time: '12–15 min',
            description: 'Convert blunt Spanish-to-English literal expressions into polite, persuasive executive idiom.',
            targetCollocations: ['with all due respect, looking at the data', 'I see merit in your proposal, however', 'our primary concern centers around'],
            simulatorScenarioPreset: 'Budget Negotiation & Trade-Offs',
            highlight: 'Reframe 3 direct objections into executive consensus-building statements.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: Delivering Quarterly OKRs & Pushback',
            time: '10–15 min',
            description: 'Deliver a concise 2-minute oral executive briefing on project milestones and budget requests.',
            targetCollocations: ['deliverables on track', 'mitigating supply chain headwinds', 'capital allocation strategy'],
            simulatorScenarioPreset: 'Executive Status Briefing',
            highlight: 'Teacher Ivan evaluates cadence, executive poise, and vocal projection.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'High-Stakes Client Proposal / Escalation Memo',
            time: '15–20 min',
            description: `Draft an executive memo directly addressing your target: "${personalObjective}".`,
            targetCollocations: ['action items and next steps', 'mitigating operational risk', 'mutual strategic benefit'],
            simulatorScenarioPreset: 'Executive Stakeholder Escalation',
            functionalWritingPrompt: `Write a 120-word executive briefing memo addressing your personal goal: "${personalObjective}". Outline the primary business challenge, propose a two-phase action roadmap, and define 2 key performance metrics with corporate collocations.`,
            highlight: 'Feedback focused on conciseness, diplomatic tone, and corporate credibility.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Live Boardroom Defense with Tutor Emma',
            time: '10–15 min',
            description: 'Present your proposal to an AI investor board that challenges your pricing assumptions.',
            targetCollocations: ['return on investment', 'mitigating enterprise exposure', 'scale operations sustainably'],
            simulatorScenarioPreset: 'Venture Pitch & Cross-Examination',
            highlight: 'Generate your weekly Executive Fluency & WPM Speech Velocity scorecard.',
          },
        ],
      };

    case 'Daily Conversational Fluency':
    default:
      return {
        targetLevel,
        primaryGoal: primaryGoal || 'Daily Conversational Fluency',
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Spontaneous Idiomatic Chunks & Connected Speech',
            time: '10–12 min',
            description: `Analyze authentic native conversational exchanges featuring contractions, elision, and small talk flow. Focus: ${focusSkill}.`,
            targetCollocations: ['catch up with', 'hit the ground running', 'make ends meet', 'keep an eye on'],
            simulatorScenarioPreset: 'Coffee Shop Small Talk & Culture',
            highlight: 'Notice 3 instances where consonants link smoothly across word boundaries.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'Conversational Echo Questions & Storytelling Flow',
            time: '12–15 min',
            description: 'Learn to narrate personal anecdotes with engaging transition markers ("Guess what happened next...", "Out of nowhere...").',
            targetCollocations: ['out of the blue', 'to make matters worse', 'it turns out that'],
            simulatorScenarioPreset: 'Casual Dinner Party Storytelling',
            highlight: 'Practice 3 response tags to keep conversations alive effortlessly.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: "A Day That Changed My Perspective"',
            time: '10–15 min',
            description: 'Send a natural 90-second voice note telling a personal story with emotion and descriptive vocabulary.',
            targetCollocations: ['unforgettable experience', 'completely caught off guard', 'looking back on it now'],
            simulatorScenarioPreset: 'Weekend Travel Experience',
            highlight: 'Receive feedback on intonation patterns, word stress, and pronunciation.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'Casual Digital Messaging & Personal Reflection',
            time: '15–20 min',
            description: `Write a natural conversational text/email reflecting your goal: "${personalObjective}".`,
            targetCollocations: ['let me know how it goes', 'been meaning to tell you', 'catch you later'],
            simulatorScenarioPreset: 'Planning a Trip with Friends',
            functionalWritingPrompt: `Write a 100-word warm, conversational message to a native-speaking friend or colleague sharing your exciting objective: "${personalObjective}". Use at least 2 phrasal verbs, 1 idiomatic expression, and natural informal transitions.`,
            highlight: 'Teacher Ivan checks naturalness, tone consistency, and slang appropriateness.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Free-Flowing Voice Chat with Emma',
            time: '10–15 min',
            description: 'An unstructured, real-time voice chat covering hobbies, aspirations, and current events.',
            targetCollocations: ['can you imagine', 'from my perspective', 'to tell you the truth'],
            simulatorScenarioPreset: 'Casual Walk & Talk Conversation',
            highlight: 'Celebrate your 5-day streak and review your updated CEFR proficiency level.',
          },
        ],
      };
  }
}

/**
 * Generates an AI-tailored 5-Day Micro-Learning Sprint using Gemini
 * (gemini-3.1-flash-lite -> gemini-2.5-flash), with an instant deterministic
 * fallback so the platform never fails.
 */
export async function generateWeeklySprint(goals: LearningGoals): Promise<GeneratedSprint> {
  const rawApiKey = process.env.GEMINI_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : '';

  // If no API key is available, return deterministic sprint immediately
  if (!apiKey || apiKey === '' || apiKey === 'your_gemini_api_key_here') {
    return getDeterministicSprint(goals);
  }

  const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are Teacher Ivan, a world-class bilingual English tutor.
A student has completed their mandatory onboarding profile and requires a personalized 5-Day Micro-Learning Sprint (D1 to D5).

STUDENT PROFILE:
- Target CEFR Level: ${goals.targetLevel}
- Primary Learning Goal: ${goals.primaryGoal}
- Priority Focus Skill: ${goals.focusSkill}
- Specific Personal Objective: "${goals.personalObjective}"

Generate a 5-day sprint strictly in JSON format conforming to this exact structure:
{
  "days": [
    {
      "day": "D1",
      "type": "Receptive Input",
      "title": "string (engaging, customized to goal)",
      "time": "10–12 min",
      "description": "string (personalized explanation)",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3", "collocation 4"],
      "simulatorScenarioPreset": "string (name of matching roleplay scenario)",
      "highlight": "string (key actionable learning takeaway)"
    },
    {
      "day": "D2",
      "type": "Structural Processing",
      "title": "string",
      "time": "12–15 min",
      "description": "string",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3"],
      "simulatorScenarioPreset": "string",
      "highlight": "string"
    },
    {
      "day": "D3",
      "type": "Async Oral Production",
      "title": "string",
      "time": "10–15 min",
      "description": "string",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3"],
      "simulatorScenarioPreset": "string",
      "highlight": "string"
    },
    {
      "day": "D4",
      "type": "Functional Writing Prompt",
      "title": "string",
      "time": "15–20 min",
      "description": "string",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3"],
      "simulatorScenarioPreset": "string",
      "functionalWritingPrompt": "A detailed 80-150 word writing prompt explicitly mentioning and targeting the student's personal objective: '${goals.personalObjective}'",
      "highlight": "string"
    },
    {
      "day": "D5",
      "type": "Weekly Closure",
      "title": "string",
      "time": "10–15 min",
      "description": "string",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3"],
      "simulatorScenarioPreset": "string",
      "highlight": "string"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY valid JSON, with NO surrounding markdown or commentary.
2. Ensure the Day 4 functionalWritingPrompt is deeply tailored to: "${goals.personalObjective}".
3. Keep collocations high-frequency, natural, and directly applicable to "${goals.primaryGoal}".`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (!text) continue;

      // Clean potential markdown fences
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanJson);

      if (parsed && Array.isArray(parsed.days) && parsed.days.length === 5) {
        return {
          targetLevel: goals.targetLevel,
          primaryGoal: goals.primaryGoal,
          focusSkill: goals.focusSkill,
          personalObjective: goals.personalObjective,
          days: parsed.days,
          generatedBy: 'gemini',
          modelUsed: model,
        };
      }
    } catch (err) {
      console.warn(`[CurriculumGenerator] Model ${model} failed or timed out:`, err instanceof Error ? err.message : err);
      // Try next model in chain
    }
  }

  // Graceful deterministic fallback
  console.info('[CurriculumGenerator] Returning deterministic fallback sprint');
  return getDeterministicSprint(goals);
}
