import { Router, Request, Response } from 'express';
import { mintEphemeralToken } from '../services/geminiAuth.js';

const router = Router();

/**
 * Handles minting a short-lived ephemeral token for client-side Live API connections.
 * Supports both GET and POST requests.
 */
async function handleTokenRequest(req: Request, res: Response): Promise<void> {
  try {
    const requestedModel = (req.body?.model || req.query?.model) as string | undefined;
    const tokenData = await mintEphemeralToken(requestedModel);

    res.status(200).json({
      success: true,
      data: tokenData,
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
