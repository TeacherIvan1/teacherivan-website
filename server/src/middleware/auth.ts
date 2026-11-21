import { Request, Response, NextFunction } from 'express';
import { userStore, User } from '../services/userStore.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Extracts and verifies the bearer token from the Authorization header.
 * Attaches the authenticated User object to req.user.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.query.token === 'string') {
    token = req.query.token.trim();
  } else if (typeof req.body?.token === 'string') {
    token = req.body.token.trim();
  }

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Missing Bearer token.',
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
  // First run requireAuth check if user not already attached
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
 * Optional authentication: attaches req.user if a valid token is present,
 * but does not halt the request if absent.
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.query.token === 'string') {
    token = req.query.token.trim();
  }

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
