import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import tokenRouter from './routes/token.js';
import reportRouter from './routes/report.js';
import authRouter from './routes/auth.js';
import bookingRouter from './routes/bookings.js';
import curriculumRouter from './routes/curriculum.js';
import sheetsRouter from './routes/sheets.js';
import { userStore } from './services/userStore.js';
import { bookingStore } from './services/bookingStore.js';
import { googleDbService } from './services/googleDbService.js';
import { initRemoteBackup } from './services/remoteBackup.js';
import { requireAdmin, optionalAuth, AuthenticatedRequest } from './middleware/auth.js';

// Resolve directory paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Ensure JWT_SECRET is available in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    const fallbackSecret = crypto.randomBytes(24).toString('hex');
    process.env.JWT_SECRET = fallbackSecret;
    console.warn('[SECURITY WARNING] JWT_SECRET environment variable was not set in production. Generated ephemeral in-memory 48-char random secret. Please configure persistent JWT_SECRET in Render Environment Variables!');
  }
}

const app = express();
app.set('trust proxy', 1); // Required behind Render's TLS reverse proxy for Secure cookies
const port = parseInt(process.env.PORT || '3001', 10);
const isProd = process.env.NODE_ENV === 'production';

// Apply Helmet for defense-in-depth HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// Mount cookie-parser for HttpOnly session cookies
app.use(cookieParser());

// Strict CORS Origins
const allowedOrigins = [
  'https://teacherivan.com',
  'https://www.teacherivan.com',
  ...(isProd
    ? []
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
        'http://localhost:3000',
        'http://localhost:3001',
      ]),
];

// Add extra origins if specified in environment
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach((o) => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

// CORS Middleware with strict validation & credentials: true
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (!isProd && (origin.endsWith('.github.io') || origin.endsWith('.onrender.com'))) {
        return callback(null, true);
      }

      return callback(new Error(`CORS Error: Origin ${origin} not permitted.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// CSRF Origin Validation Middleware on all state-changing routes under /api/
app.use('/api', (req, res, next) => {
  const statefulMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!statefulMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  let requestOrigin = req.headers.origin;
  if (!requestOrigin && req.headers.referer) {
    try {
      const refUrl = new URL(req.headers.referer);
      requestOrigin = refUrl.origin;
    } catch {
      requestOrigin = undefined;
    }
  }

  if (requestOrigin) {
    const isAllowed =
      allowedOrigins.includes(requestOrigin) ||
      (!isProd &&
        (requestOrigin.startsWith('http://localhost:') ||
          requestOrigin.startsWith('http://127.0.0.1:') ||
          requestOrigin.endsWith('.github.io') ||
          requestOrigin.endsWith('.onrender.com')));

    if (!isAllowed) {
      return res.status(403).json({
        error: `CSRF Origin Validation Failed: Origin ${requestOrigin} is not permitted.`,
      });
    }
  } else if (isProd) {
    // In production, require valid Origin or Referer on browser state-changing requests
    return res.status(403).json({
      error: 'CSRF Origin Validation Failed: Missing Origin or Referer header.',
    });
  }

  next();
});

app.use(express.json({ limit: '1mb' }));

// Rate Limiters (API Security & Throttling)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
    errorEs: 'Demasiados intentos de acceso. Por favor intenta de nuevo en 15 minutos.',
    errorEn: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many booking requests. Please wait a few minutes.',
  },
});

const aiGenLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI generation rate limit reached. Please wait before generating more resources.',
  },
});

// Apply Rate Limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/recover-password', authLimiter);
app.use('/api/bookings', bookingLimiter);
app.use('/api/curriculum', aiGenLimiter);
app.use('/api/report', aiGenLimiter);

// Routes
app.use('/api/token', tokenRouter);
app.use('/api/report', reportRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/curriculum', curriculumRouter);
app.use('/api/sheets', sheetsRouter);

// GET /api/users/export (Protected by requireAdmin)
app.get('/api/users/export', requireAdmin, async (req: AuthenticatedRequest, res) => {
  if (req.query.force === 'true') {
    await googleDbService.syncFromGoogleDb(true);
  }
  const users = userStore.getAllUsers();
  res.status(200).json({
    status: 'ok',
    total: users.length,
    users,
    googleDbStatus: googleDbService.getStatus(),
  });
});

// POST /api/users/rehydrate-roster
app.post('/api/users/rehydrate-roster', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { users, bookings } = req.body || {};
    const callingUser = req.user;

    if (Array.isArray(users) && users.length > 0) {
      if (!callingUser || callingUser.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden: Admin access required to rehydrate user accounts.',
        });
      }
    }

    let safeBookings = bookings || [];
    if (callingUser && callingUser.role !== 'admin') {
      safeBookings = safeBookings.filter(
        (b: any) =>
          b &&
          (b.studentId === callingUser.id ||
            userStore.normalizeEmail(b.studentEmail) === userStore.normalizeEmail(callingUser.email))
      );
    } else if (!callingUser) {
      safeBookings = [];
    }

    const mergedUsers = (callingUser && callingUser.role === 'admin' && users)
      ? userStore.rehydrateRoster(users)
      : userStore.getAllUsers();
    const mergedBookings = safeBookings.length > 0
      ? bookingStore.rehydrateBookings(safeBookings)
      : bookingStore.getAllBookings();

    return res.status(200).json({
      status: 'ok',
      totalUsers: mergedUsers.length,
      totalBookings: mergedBookings.length,
      users: mergedUsers,
      bookings: mergedBookings,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/users/rehydrate-roster Error]:', msg);
    return res.status(500).json({ error: 'Internal server error rehydrating roster' });
  }
});

// PUT /api/users/:id/plan (Admin manual plan update - Protected by requireAdmin)
app.put('/api/users/:id/plan', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { plan } = req.body || {};

    if (!['free', 'essential', 'pro', 'executive'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Allowed values: free, essential, pro, executive' });
    }

    const updated = userStore.updateUserPlan(id, plan);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    googleDbService.upsertUserInGoogleDb(updated).catch((dbErr) => {
      console.warn('[Google DB] Async upsert plan update notice:', dbErr);
    });

    return res.status(200).json({
      status: 'ok',
      user: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[PUT /api/users/:id/plan Error]:', msg);
    return res.status(500).json({ error: 'Internal server error updating user plan' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    apiKeyConfigured: hasKey,
    defaultModel: process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-latest',
    googleAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    googleDbStatus: googleDbService.isConfigured() ? 'connected' : 'not_configured',
    googleDbDetails: googleDbService.getStatus(),
    userCount: userStore.getAllUsers().length,
    bookingCount: bookingStore.getAllBookings().length,
  });
});

// Start listening
app.listen(port, () => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  console.log(`\n======================================================`);
  console.log(` Gemini Live Tutor Server running on http://localhost:${port}`);
  console.log(` Endpoint: POST /api/token or GET /api/token`);
  console.log(` Health:   GET /api/health`);
  console.log(` API Key Status: ${hasKey ? 'Configured [OK]' : 'Missing or Placeholder [WARNING]'}`);
  if (!hasKey) {
    console.log(` -> Set GEMINI_API_KEY in server/.env or root .env to enable token minting`);
  }
  console.log(`======================================================\n`);

  initRemoteBackup().catch((err) => {
    console.warn('[Remote Backup] Initialization notice:', err);
  });

  googleDbService.syncFromGoogleDb().catch((err) => {
    console.warn('[Google Database] Startup sync notice:', err);
  });
});
