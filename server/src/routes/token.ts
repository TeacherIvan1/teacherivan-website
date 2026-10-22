import { Router, Request, Response } from 'express';
import { mintEphemeralToken } from '../services/geminiAuth.js';
import { userStore } from '../services/userStore.js';

const router = Router();

/**
 * Handles minting a short-lived ephemeral token for client-side Live API connections.
 * Supports both GET and POST requests. Enforces daily simulator quotas by plan.
 */
async function handleTokenRequest(req: Request, res: Response): Promise<void> {
  try {
    const requestedModel = (req.body?.model || req.query?.model) as string | undefined;
    const userIdOrEmail = (req.body?.userId || req.body?.email || req.query?.userId || req.query?.email) as string | undefined;

    let quotaResult: { allowed: boolean; reason?: string; quota: { used: number; max: number; plan: string } } | undefined;

    if (userIdOrEmail) {
      quotaResult = userStore.checkAndIncrementDailyQuota(userIdOrEmail);
      if (!quotaResult.allowed) {
        res.status(403).json({
          success: false,
          error: 'DAILY_QUOTA_REACHED',
          message: quotaResult.reason || 'Has alcanzado tu límite diario de sesiones del simulador de voz.',
          quota: quotaResult.quota,
        });
        return;
      }
    }

    const tokenData = await mintEphemeralToken(requestedModel);

    res.status(200).json({
      success: true,
      data: tokenData,
      quota: quotaResult?.quota,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[Token Route Error]:', message);

    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

router.get('/', handleTokenRequest);
router.post('/', handleTokenRequest);

export default router;
