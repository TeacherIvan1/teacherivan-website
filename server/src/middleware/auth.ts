import { Request, Response, NextFunction } from 'express';
import { userStore, User } from '../services/userStore.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const AUTH_COOKIE_NAME = 'ti_session';
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Sets the HttpOnly session cookie (`ti_session`) on the Express response.
 * - Production: { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 7 days }
 * - Local Dev:  { httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 7 days }
 */
export function setAuthCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  });
}

/**
 * Clears the HttpOnly session cookie (`ti_session`) on the Express response.
 */
export function clearAuthCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

/**
 * Extracts the session JWT from the `ti_session` HttpOnly cookie
 * (with fallback to Authorization: Bearer for automated unit tests).
 */
export function extractSessionToken(req: Request): string | undefined {
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.trim()) {
    return cookieToken.trim();
  }

  // Fallback for automated server unit tests only
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return undefined;
}

/**
 * Requires an active authenticated session from the HttpOnly `ti_session` cookie.
 * Attaches the authenticated User object to req.user.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractSessionToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Missing session cookie.',
      errorEs: 'Autenticación requerida. Inicia sesión para continuar.',
      errorEn: 'Authentication required. Please sign in to continue.',
    });
    return;
  }

  const payload = userStore.verifySessionToken(token);
  if (!payload || !payload.userId) {
    res.status(401).json({
      error: 'Invalid or expired session token.',
      errorEs: 'Tu sesión ha expirado o no es válida. Por favor inicia sesión nuevamente.',
      errorEn: 'Your session has expired or is invalid. Please sign in again.',
    });
    return;
  }

  const user = userStore.findById(payload.userId) || userStore.findByEmail(payload.userId);
  if (!user) {
    res.status(401).json({
      error: 'User associated with session not found.',
      errorEs: 'Usuario no encontrado. Inicia sesión nuevamente.',
      errorEn: 'User associated with session not found. Please sign in again.',
    });
    return;
  }

  req.user = user;
  next();
}

/**
 * Ensures that the authenticated user possesses the 'admin' role.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    requireAuth(req, res, () => {
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          error: 'Forbidden: Administrator privileges required.',
          errorEs: 'Acceso denegado: Se requieren privilegios de administrador.',
          errorEn: 'Forbidden: Administrator privileges required.',
        });
        return;
      }
      next();
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden: Administrator privileges required.',
      errorEs: 'Acceso denegado: Se requieren privilegios de administrador.',
      errorEn: 'Forbidden: Administrator privileges required.',
    });
    return;
  }

  next();
}

/**
 * Optional authentication: attaches req.user if a valid session cookie is present,
 * but does not halt the request if absent.
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = extractSessionToken(req);

  if (token) {
    const payload = userStore.verifySessionToken(token);
    if (payload && payload.userId) {
      const user = userStore.findById(payload.userId) || userStore.findByEmail(payload.userId);
      if (user) {
        req.user = user;
      }
    }
  }

  next();
}
