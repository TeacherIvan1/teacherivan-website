import { Router, Request, Response } from 'express';
import { generateSessionReport, ReportGenerationParams } from '../services/reportService.js';

const router = Router();

/**
 * POST /api/report
 * Generates an analytical report from the session transcript.
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { turns, level, correctionMode, scenario, durationSeconds } = req.body as Partial<ReportGenerationParams>;

    if (!turns || !Array.isArray(turns)) {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid "turns" array in request body',
      });
      return;
    }

    if (!scenario || typeof scenario !== 'object' || !scenario.title) {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid "scenario" object in request body',
      });
      return;
    }

    const result = await generateSessionReport({
      turns,
      level: level || 'intermediate',
      correctionMode: correctionMode || 'coaching',
      scenario: {
        title: scenario.title,
        category: scenario.category || 'General',
        description: scenario.description || '',
        targetVocabulary: scenario.targetVocabulary || [],
        targetGrammar: scenario.targetGrammar || [],
      },
      durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : 0,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[Report Route Error]:', message);

    // Check if error is due to Google Gemini rate limits (429 / RESOURCE_EXHAUSTED)
    const isRateLimit =
      message.includes('429') ||
      message.includes('RESOURCE_EXHAUSTED') ||
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('rate limit');

    if (isRateLimit) {
      res.status(429).json({
        success: false,
        rateLimited: true,
        error: 'Gemini API rate limit reached. Please wait a few seconds and click Retry.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

export default router;
