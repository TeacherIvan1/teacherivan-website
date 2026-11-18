import { Router, Request, Response } from 'express';
import {
  generateWeeklySprint,
  generateCustomResource,
  type LearningGoals,
  type CustomResourceRequest,
} from '../services/curriculumGenerator.js';

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

/**
 * POST /api/curriculum/generate-custom-resource
 * Body: CustomResourceRequest { topic, targetLevel, resourceType, studentGoal }
 * Generates an on-demand custom learning resource (article, dialogue, vocab deck, worksheet).
 */
router.post('/generate-custom-resource', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const topic = (body.topic || '').trim();

    if (!topic) {
      return res.status(400).json({
        error: 'A topic or situation is required to generate a custom resource.',
      });
    }

    const requestPayload: CustomResourceRequest = {
      topic,
      targetLevel: body.targetLevel || 'B2',
      resourceType: body.resourceType || 'article_collocations',
      studentGoal: body.studentGoal || 'Spoken English Mastery',
    };

    const resource = await generateCustomResource(requestPayload);

    return res.status(200).json({
      status: 'ok',
      resource,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/curriculum/generate-custom-resource Error]:', msg);
    return res.status(500).json({
      error: 'Failed to generate custom curriculum resource.',
    });
  }
});

export default router;
