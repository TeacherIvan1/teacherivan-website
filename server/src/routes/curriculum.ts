import { Router, Request, Response } from 'express';
import { generateWeeklySprint, type LearningGoals } from '../services/curriculumGenerator.js';

const router = Router();

/**
 * POST /api/curriculum/generate-sprint
 * Body: { learningGoals: LearningGoals }
 * Generates an AI-tailored 5-Day Micro-Learning Sprint matching the student's goals.
 */
router.post('/generate-sprint', async (req: Request, res: Response) => {
  try {
    const goalsPayload: Partial<LearningGoals> =
      req.body?.learningGoals || req.body || {};

    const targetLevel = goalsPayload.targetLevel || 'B1';
    const primaryGoal = goalsPayload.primaryGoal || 'Daily Conversational Fluency';
    const focusSkill = goalsPayload.focusSkill || 'Speaking Fluency & Pronunciation';
    const personalObjective = (goalsPayload.personalObjective || '').trim();

    if (!personalObjective) {
      return res.status(400).json({
        error: 'Personal objective is required to generate a personalized weekly sprint.',
      });
    }

    const learningGoals: LearningGoals = {
      targetLevel,
      primaryGoal,
      focusSkill,
      personalObjective,
    };

    const sprint = await generateWeeklySprint(learningGoals);

    return res.status(200).json({
      status: 'ok',
      sprint,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/curriculum/generate-sprint Error]:', msg);
    return res.status(500).json({
      error: 'Failed to generate weekly sprint curriculum.',
    });
  }
});

export default router;
