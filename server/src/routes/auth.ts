import { Router, Request, Response } from 'express';
import { userStore } from '../services/userStore.js';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { username: string, password: string, fullName: string, email: string, phoneNumber: string, dateOfBirth: string, country: string, learningGoals: object }
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { username, password, fullName, email, phoneNumber, dateOfBirth, country, learningGoals, profileCompleted } = req.body || {};

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({
        error: 'Username is required (min 3 characters)',
        errorEs: 'El nombre de usuario es obligatorio (mínimo 3 caracteres)',
        errorEn: 'Username is required (min 3 characters)',
      });
    }

    if (!password || typeof password !== 'string' || password.trim().length < 6) {
      return res.status(400).json({
        error: 'Password is required (min 6 characters)',
        errorEs: 'La contraseña es obligatoria (mínimo 6 caracteres)',
        errorEn: 'Password is required (min 6 characters)',
      });
    }

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({
        error: 'Full name is required',
        errorEs: 'El nombre completo es obligatorio',
        errorEn: 'Full name is required',
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        error: 'Valid email address is required',
        errorEs: 'Se requiere una dirección de correo válida',
        errorEn: 'Valid email address is required',
      });
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
      return res.status(400).json({
        error: 'Phone number is required',
        errorEs: 'El número de celular es obligatorio',
        errorEn: 'Phone number is required',
      });
    }

    if (!dateOfBirth || typeof dateOfBirth !== 'string' || !dateOfBirth.trim()) {
      return res.status(400).json({
        error: 'Date of birth is required',
        errorEs: 'La fecha de nacimiento es obligatoria',
        errorEn: 'Date of birth is required',
      });
    }

    if (!country || typeof country !== 'string' || !country.trim()) {
      return res.status(400).json({
        error: 'Country is required',
        errorEs: 'El país es obligatorio',
        errorEn: 'Country is required',
      });
    }

    // Check duplicate username
    const existingByUsername = userStore.findByUsername(username);
    if (existingByUsername) {
      return res.status(409).json({
        error: 'Username is already taken / El nombre de usuario ya está en uso',
        errorEs: 'El nombre de usuario ya está en uso. Por favor elige otro.',
        errorEn: 'Username is already taken. Please choose another one.',
      });
    }

    // Check duplicate email
    const existingByEmail = userStore.findByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({
        error: 'Email is already registered / El correo ya está registrado',
        errorEs: 'El correo electrónico ya está registrado. Por favor inicia sesión.',
        errorEn: 'Email is already registered. Please sign in instead.',
      });
    }

    const user = userStore.upsertUser({
      username: username.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: dateOfBirth.trim(),
      country: country.trim(),
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
 * Body: { username: string, password: string }
 * Authenticates users using strictly username and password (also accepts admin email or 'ivan' for admin).
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body || {};
    const identifier = username || email;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({
        error: 'Username is required',
        errorEs: 'El nombre de usuario es obligatorio',
        errorEn: 'Username is required',
      });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        error: 'Password is required',
        errorEs: 'La contraseña es obligatoria',
        errorEn: 'Password is required',
      });
    }

    const authResult = userStore.verifyUserCredentials(identifier.trim(), password.trim());
    if (!authResult.success || !authResult.user) {
      return res.status(401).json({
        error: 'Invalid username or password / Nombre de usuario o contraseña incorrectos',
        errorEs: 'Nombre de usuario o contraseña incorrectos',
        errorEn: 'Invalid username or password',
      });
    }

    const user = authResult.user;
    const token = userStore.createSessionToken(user.id, user.role || 'student');
    return res.status(200).json({
      status: 'ok',
      user,
      token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/login Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * POST /api/auth/recover-password
 * Body: { username: string, verificationContact: string, newPassword: string }
 * Verifies that username matches email or phoneNumber, updates password, and returns success.
 */
router.post('/recover-password', (req: Request, res: Response) => {
  try {
    const { username, verificationContact, newPassword } = req.body || {};

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({
        error: 'Username is required',
        errorEs: 'El nombre de usuario es obligatorio',
        errorEn: 'Username is required',
      });
    }

    if (!verificationContact || typeof verificationContact !== 'string' || !verificationContact.trim()) {
      return res.status(400).json({
        error: 'Registered email or phone number is required',
        errorEs: 'El correo electrónico o celular registrado es obligatorio',
        errorEn: 'Registered email or phone number is required',
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters',
        errorEs: 'La nueva contraseña debe tener al menos 6 caracteres',
        errorEn: 'New password must be at least 6 characters',
      });
    }

    const result = userStore.recoverPassword(username, verificationContact, newPassword);
    if (!result.success || !result.user) {
      return res.status(400).json({
        error: result.error || 'Password recovery failed',
        errorEs: result.error?.includes('No account found')
          ? 'No se encontró ninguna cuenta con ese nombre de usuario'
          : 'El correo electrónico o celular no coincide con el registrado para este usuario',
        errorEn: result.error || 'Password recovery failed',
      });
    }

    return res.status(200).json({
      status: 'ok',
      message: 'Password reset successfully / Contraseña restablecida con éxito',
      messageEs: 'Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.',
      messageEn: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/recover-password Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during password recovery' });
  }
});

/**
 * PUT /api/auth/profile
 * Body: { id?: string, email?: string, learningGoals: LearningGoals, cefrLevel?: string, fullName?: string, country?: string, dateOfBirth?: string }
 * Completes mandatory onboarding profile and goals.
 */
router.put('/profile', (req: Request, res: Response) => {
  try {
    const { id, email, learningGoals, cefrLevel, fullName, phoneNumber, country, dateOfBirth } = req.body || {};

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
        phoneNumber,
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
 * Body: { email: string, fullName: string, phoneNumber?: string, googleId?: string, dateOfBirth?: string, country?: string }
 */
router.post('/google', (req: Request, res: Response) => {
  try {
    const { email, fullName, phoneNumber, dateOfBirth, country, learningGoals, profileCompleted } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email is required' });
    }

    const existing = userStore.findByEmail(email);

    // If student already has completed profile
    if (existing && existing.profileCompleted && !learningGoals) {
      if (phoneNumber && phoneNumber.trim()) {
        userStore.updateUserProfile({ email }, { phoneNumber: phoneNumber.trim() });
      }
      const token = userStore.createSessionToken(existing.id);
      return res.status(200).json({
        status: 'ok',
        user: userStore.findByEmail(email) || existing,
        token,
        needsProfileCompletion: false,
      });
    }

    // If dateOfBirth and country were provided in this call, complete registration
    if (dateOfBirth && country) {
      const user = userStore.upsertUser({
        fullName: fullName || existing?.fullName || 'Google Student',
        email,
        phoneNumber: phoneNumber || existing?.phoneNumber,
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
      phoneNumber: phoneNumber || existing?.phoneNumber,
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
      phoneNumber: userPayload.phoneNumber,
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
 * PUT /api/auth/plan or /api/auth/:id/plan
 * Manual Plan Assignment by Admin
 */
router.put('/:id/plan', (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { plan } = req.body || {};

    if (!['free', 'essential', 'pro', 'executive'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Allowed: free, essential, pro, executive' });
    }

    const updated = userStore.updateUserPlan(id, plan);
    if (!updated) {
      return res.status(404).json({ error: 'Student not found in database' });
    }

    return res.status(200).json({
      status: 'ok',
      user: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[PUT /api/auth/:id/plan Error]:', msg);
    return res.status(500).json({ error: 'Internal server error updating user plan' });
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
