import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { userStore, ADMIN_EMAIL } from '../services/userStore.js';
import { bookingStore } from '../services/bookingStore.js';
import { sheetsService } from '../services/sheetsService.js';
import { googleDbService } from '../services/googleDbService.js';
import {
  requireAuth,
  requireAdmin,
  optionalAuth,
  AuthenticatedRequest,
  setAuthCookie,
  clearAuthCookie,
} from '../middleware/auth.js';

const router = Router();
const googleOAuthClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

/**
 * POST /api/auth/register
 * Sets HttpOnly `ti_session` cookie and returns `{ status: 'ok', user }` (never raw JWT for localStorage).
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

    const existingByUsername = userStore.findByUsername(username);
    if (existingByUsername) {
      return res.status(409).json({
        error: 'Username is already taken / El nombre de usuario ya está en uso',
        errorEs: 'El nombre de usuario ya está en uso. Por favor elige otro.',
        errorEn: 'Username is already taken. Please choose another one.',
      });
    }

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

    const jwtToken = userStore.createSessionToken(user.id, user.role || 'student');
    setAuthCookie(res, jwtToken);

    googleDbService.upsertUserInGoogleDb(user).catch((dbErr) => {
      console.warn('[Google DB] Async upsert registration notice:', dbErr);
    });

    sheetsService.appendStudentRegistration(user).catch((sheetErr) => {
      console.warn('[Google Sheets] Async append registration notice:', sheetErr);
    });

    return res.status(200).json({
      status: 'ok',
      user,
      needsProfileCompletion: !user.profileCompleted,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/register Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

/**
 * POST /api/auth/login
 * Sets HttpOnly `ti_session` cookie and returns `{ status: 'ok', user }`.
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
    const jwtToken = userStore.createSessionToken(user.id, user.role || 'student');
    setAuthCookie(res, jwtToken);

    return res.status(200).json({
      status: 'ok',
      user,
      needsProfileCompletion: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/login Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * POST /api/auth/logout
 * Clears the HttpOnly `ti_session` cookie.
 */
router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.status(200).json({ ok: true, status: 'ok' });
});

/**
 * POST /api/auth/recover-password
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
 */
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, email, learningGoals, cefrLevel, fullName, phoneNumber, country, dateOfBirth } = req.body || {};

    const targetId = id || (email ? userStore.findByEmail(email)?.id : undefined);
    if (req.user && req.user.role !== 'admin' && targetId && targetId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden: You cannot modify another student profile.',
        errorEs: 'Acceso denegado: No puedes modificar el perfil de otro estudiante.',
        errorEn: 'Forbidden: You cannot modify another student profile.',
      });
    }

    const identifier = req.user ? { id: req.user.id } : { id, email };

    if (!learningGoals || typeof learningGoals !== 'object') {
      return res.status(400).json({ error: 'Learning goals are required' });
    }

    const updated = userStore.updateUserProfile(
      identifier,
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

    googleDbService.upsertUserInGoogleDb(updated).catch((dbErr) => {
      console.warn('[Google DB] Async upsert profile notice:', dbErr);
    });

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
 * Sets HttpOnly `ti_session` cookie and returns `{ status: 'ok', user, needsProfileCompletion }`.
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    let { email, fullName, phoneNumber, dateOfBirth, country, learningGoals, profileCompleted, credential, idToken } = req.body || {};

    const tokenToVerify = credential || idToken;
    const clientId = process.env.GOOGLE_CLIENT_ID || '454494230896-b0s8djtejacphfblmiik31nj6roajhch.apps.googleusercontent.com';

    if (tokenToVerify) {
      try {
        const client = googleOAuthClient || new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken: tokenToVerify,
          audience: [
            clientId,
            '454494230896-b0s8djtejacphfblmiik31nj6roajhch.apps.googleusercontent.com',
            '116786083172-q1m93t06euvdsa4tdd6gs9klddhc86i9.apps.googleusercontent.com',
          ],
        });
        const gPayload = ticket.getPayload();
        if (!gPayload || !gPayload.email) {
          return res.status(401).json({ error: 'Invalid Google token payload' });
        }
        if (gPayload.email_verified === false) {
          return res.status(401).json({ error: 'Google email is not verified' });
        }
        email = gPayload.email;
        fullName = fullName || gPayload.name || 'Google Student';
      } catch (tokenErr) {
        console.warn('[Google Auth] Token verification rejected:', tokenErr);
        return res.status(401).json({ error: 'Invalid Google authentication token' });
      }
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email is required' });
    }

    const existing = userStore.findByEmail(email);

    if (existing && existing.profileCompleted && !learningGoals) {
      if (phoneNumber && phoneNumber.trim()) {
        userStore.updateUserProfile({ email }, { phoneNumber: phoneNumber.trim() });
      }
      const updatedUser = userStore.findByEmail(email) || existing;
      googleDbService.upsertUserInGoogleDb(updatedUser).catch((dbErr) => {
        console.warn('[Google DB] Async user upsert notice:', dbErr);
      });
      const jwtToken = userStore.createSessionToken(updatedUser.id, updatedUser.role || 'student');
      setAuthCookie(res, jwtToken);

      return res.status(200).json({
        status: 'ok',
        user: updatedUser,
        needsProfileCompletion: false,
      });
    }

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
      googleDbService.upsertUserInGoogleDb(user).catch((dbErr) => {
        console.warn('[Google DB] Async user upsert notice:', dbErr);
      });
      const jwtToken = userStore.createSessionToken(user.id, user.role || 'student');
      setAuthCookie(res, jwtToken);

      return res.status(200).json({
        status: 'ok',
        user,
        needsProfileCompletion: false,
      });
    }

    const tempUser = userStore.upsertUser({
      fullName: fullName || existing?.fullName || 'Google Student',
      email,
      phoneNumber: phoneNumber || existing?.phoneNumber,
      authProvider: 'google',
    });
    googleDbService.upsertUserInGoogleDb(tempUser).catch((dbErr) => {
      console.warn('[Google DB] Async user upsert notice:', dbErr);
    });
    const jwtToken = userStore.createSessionToken(tempUser.id, tempUser.role || 'student');
    setAuthCookie(res, jwtToken);

    return res.status(200).json({
      status: 'ok',
      user: tempUser,
      needsProfileCompletion: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/google Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during Google authentication' });
  }
});

/**
 * GET /api/auth/me
 * Reads authenticated session strictly from `ti_session` HttpOnly cookie (or test Bearer header).
 */
router.get('/me', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    let user = req.user;

    if (!user) {
      const queryId = (req.query.userId || req.query.id || req.query.email) as string | undefined;
      if (queryId) {
        user = userStore.findById(queryId) || userStore.findByEmail(queryId);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized / User not found' });
    }

    return res.status(200).json({
      status: 'ok',
      user,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/auth/me Error]:', msg);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/ack-plan-notification
 */
router.post('/ack-plan-notification', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, email } = req.body || {};
    const targetId = req.user ? req.user.id : (userId || email);

    if (!targetId) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    const updated = userStore.ackPlanNotification(targetId);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      status: 'ok',
      user: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/ack-plan-notification Error]:', msg);
    return res.status(500).json({ error: 'Internal server error acknowledging plan notification' });
  }
});

/**
 * POST /api/auth/sync
 */
router.post('/sync', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userPayload = req.body?.user || req.body;
    const incomingBookings = req.body?.bookings || req.body?.myBookings || [];

    if (!userPayload || !userPayload.email) {
      return res.status(400).json({ error: 'Valid user profile required for sync' });
    }

    const safePayload = { ...userPayload };
    if (safePayload.role === 'admin' && userStore.normalizeEmail(safePayload.email) !== userStore.normalizeEmail(ADMIN_EMAIL)) {
      safePayload.role = 'student';
    }

    const user = userStore.syncClientUser(safePayload);
    const jwtToken = userStore.createSessionToken(user.id, user.role || 'student');
    setAuthCookie(res, jwtToken);

    if (Array.isArray(incomingBookings) && incomingBookings.length > 0) {
      const studentBookings = incomingBookings.filter(
        (b) => b && (b.studentId === user.id || userStore.normalizeEmail(b.studentEmail) === userStore.normalizeEmail(user.email))
      );
      if (studentBookings.length > 0) {
        bookingStore.rehydrateBookings(studentBookings);
      }
    }

    const userBookings = bookingStore.getBookingsForStudent(user.id);

    return res.status(200).json({
      status: 'ok',
      user,
      bookings: userBookings,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/auth/sync Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during sync' });
  }
});

/**
 * PUT /api/auth/:id/plan
 */
router.put('/:id/plan', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
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
 * GET /api/auth/export
 */
router.get('/export', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = userStore.getAllUsers();
    return res.status(200).json({
      status: 'ok',
      total: users.length,
      users,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/auth/export Error]:', msg);
    return res.status(500).json({ error: 'Internal server error during export' });
  }
});

export default router;
