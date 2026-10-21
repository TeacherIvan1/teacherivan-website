import { Router, Request, Response } from 'express';
import { userStore } from '../services/userStore.js';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { fullName: string, email: string, dateOfBirth: string, country: string }
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { fullName, email, dateOfBirth, country, learningGoals, profileCompleted } = req.body || {};

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
      profileCompleted: profileCompleted !== undefined ? profileCompleted : (learningGoals ? true : false),
      learningGoals,
      cefrLevel: learningGoals?.targetLevel,
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
 * POST /api/auth/login
 * Body: { email: string, password?: string }
 * Handles admin credential login (returning role: 'admin') and returning student login.
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const normEmail = userStore.normalizeEmail(email);
    const isAdminEmail = normEmail === userStore.normalizeEmail(process.env.ADMIN_EMAIL || 'ivan@teacherivan.com');

    if (isAdminEmail) {
      if (!password || !userStore.verifyAdminCredentials(email, password)) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      let admin = userStore.findByEmail(normEmail);
      if (!admin) {
        admin = userStore.upsertUser({
          fullName: 'Teacher Ivan (Admin)',
          email: normEmail,
          role: 'admin',
          profileCompleted: true,
        });
      }

      const token = userStore.createSessionToken(admin.id, 'admin');
      return res.status(200).json({
        status: 'ok',
        user: admin,
        token,
      });
    }

    // Returning student login
    const existing = userStore.findByEmail(normEmail);
    if (!existing) {
      return res.status(404).json({ error: 'Account not found. Please register first.' });
    }

    const token = userStore.createSessionToken(existing.id, existing.role || 'student');
    return res.status(200).json({
      status: 'ok',
      user: existing,
      token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/login Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * PUT /api/auth/profile
 * Body: { id?: string, email?: string, learningGoals: LearningGoals, cefrLevel?: string, fullName?: string, country?: string, dateOfBirth?: string }
 * Completes mandatory onboarding profile and goals.
 */
router.put('/profile', (req: Request, res: Response) => {
  try {
    const { id, email, learningGoals, cefrLevel, fullName, country, dateOfBirth } = req.body || {};

    if (!id && !email) {
      return res.status(400).json({ error: 'Student ID or email is required to update profile' });
    }

    if (!learningGoals || typeof learningGoals !== 'object') {
      return res.status(400).json({ error: 'Learning goals are required' });
    }

    const updated = userStore.updateUserProfile(
      { id, email },
      {
        learningGoals,
        cefrLevel: cefrLevel || learningGoals.targetLevel,
        fullName,
        country,
        dateOfBirth,
        profileCompleted: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    return res.status(200).json({
      status: 'ok',
      user: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[PUT /api/auth/profile Error]:', msg);
    return res.status(500).json({ error: 'Internal server error updating profile' });
  }
});

/**
 * POST /api/auth/google
 * Body: { email: string, fullName: string, googleId?: string, dateOfBirth?: string, country?: string }
 */
router.post('/google', (req: Request, res: Response) => {
  try {
    const { email, fullName, dateOfBirth, country, learningGoals, profileCompleted } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email is required' });
    }

    const existing = userStore.findByEmail(email);

    // If student already has completed profile
    if (existing && existing.profileCompleted && !learningGoals) {
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
        profileCompleted: profileCompleted !== undefined ? profileCompleted : Boolean(learningGoals),
        learningGoals: learningGoals || existing?.learningGoals,
        cefrLevel: learningGoals?.targetLevel || existing?.cefrLevel,
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
