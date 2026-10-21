import { Router, Request, Response } from 'express';
import { userStore } from '../services/userStore.js';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { fullName: string, email: string, dateOfBirth: string, country: string }
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { fullName, email, dateOfBirth, country } = req.body || {};

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    if (!dateOfBirth || typeof dateOfBirth !== 'string' || !dateOfBirth.trim()) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }
    if (!country || typeof country !== 'string' || !country.trim()) {
      return res.status(400).json({ error: 'Country is required' });
    }

    const user = userStore.upsertUser({
      fullName,
      email,
      dateOfBirth,
      country,
      authProvider: 'email',
    });

    const token = userStore.createSessionToken(user.id);

    return res.status(200).json({
      status: 'ok',
      user,
      token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/register Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

/**
 * POST /api/auth/google
 * Body: { email: string, fullName: string, googleId?: string, dateOfBirth?: string, country?: string }
 */
router.post('/google', (req: Request, res: Response) => {
  try {
    const { email, fullName, dateOfBirth, country } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email is required' });
    }

    const existing = userStore.findByEmail(email);

    // If student already has completed profile
    if (existing && existing.dateOfBirth && existing.country) {
      const token = userStore.createSessionToken(existing.id);
      return res.status(200).json({
        status: 'ok',
        user: existing,
        token,
        needsProfileCompletion: false,
      });
    }

    // If dateOfBirth and country were provided in this call, complete registration
    if (dateOfBirth && country) {
      const user = userStore.upsertUser({
        fullName: fullName || existing?.fullName || 'Google Student',
        email,
        dateOfBirth,
        country,
        authProvider: 'google',
      });
      const token = userStore.createSessionToken(user.id);
      return res.status(200).json({
        status: 'ok',
        user,
        token,
        needsProfileCompletion: false,
      });
    }

    // First-time Google user: profile incomplete, needs dateOfBirth + country
    const tempUser = userStore.upsertUser({
      fullName: fullName || existing?.fullName || 'Google Student',
      email,
      authProvider: 'google',
    });
    const token = userStore.createSessionToken(tempUser.id);

    return res.status(200).json({
      status: 'ok',
      user: tempUser,
      token,
      needsProfileCompletion: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/google Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during Google authentication' });
  }
});

/**
 * POST /api/auth/sync
 * Body: { user: User } or user fields
 */
router.post('/sync', (req: Request, res: Response) => {
  try {
    const userPayload = req.body?.user || req.body;
    if (!userPayload || !userPayload.email) {
      return res.status(400).json({ error: 'Valid user profile required for sync' });
    }

    const user = userStore.upsertUser({
      fullName: userPayload.fullName,
      email: userPayload.email,
      dateOfBirth: userPayload.dateOfBirth,
      country: userPayload.country,
      authProvider: userPayload.authProvider || 'email',
      cefrLevel: userPayload.cefrLevel,
      lastScore: userPayload.lastScore,
    });

    const token = userStore.createSessionToken(user.id);

    return res.status(200).json({
      status: 'ok',
      user,
      token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/sync Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during sync' });
  }
});

/**
 * GET /api/users/export (or /api/auth/export)
 */
router.get('/export', (_req: Request, res: Response) => {
  try {
    const users = userStore.getAllUsers();
    return res.status(200).json({
      status: 'ok',
      total: users.length,
      users,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/users/export Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during export' });
  }
});

export default router;
