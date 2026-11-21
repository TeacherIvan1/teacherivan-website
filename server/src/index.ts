import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import tokenRouter from './routes/token.js';
import reportRouter from './routes/report.js';
import authRouter from './routes/auth.js';
import bookingRouter from './routes/bookings.js';
import curriculumRouter from './routes/curriculum.js';
import sheetsRouter from './routes/sheets.js';
import { userStore, ADMIN_EMAIL } from './services/userStore.js';
import { bookingStore } from './services/bookingStore.js';
import { googleDbService } from './services/googleDbService.js';
import { initRemoteBackup } from './services/remoteBackup.js';
import { requireAdmin, requireAuth, optionalAuth, AuthenticatedRequest } from './middleware/auth.js';

// Resolve directory paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Fail closed in production if required security secrets are absent
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    console.error('FATAL ERROR: JWT_SECRET environment variable must be set in production (min 16 chars).');
    process.exit(1);
  }
}

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);
const isProd = process.env.NODE_ENV === 'production';

// Apply Helmet for defense-in-depth HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// Strict CORS Origins
const allowedOrigins = [
  'https://teacherivan.com',
  'https://www.teacherivan.com',
  ...(isProd
    ? []
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
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

// CORS Middleware with strict validation (no blanket reflection)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile native apps, curl, server-to-server, Render health checks)
      if (!origin) {
        return callback(null, true);
      }

      // Check strictly allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow github preview origins if in dev
      if (!isProd && (origin.endsWith('.github.io') || origin.endsWith('.onrender.com'))) {
        return callback(null, true);
      }

      // Deny untrusted origins
      return callback(new Error(`CORS Error: Origin ${origin} not permitted.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(express.json({ limit: '1mb' }));

// Rate Limiters (API Security & Throttling)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
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
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 AI requests per 10 min
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
// Protected: Only Admin can rehydrate full roster; logged in students can only rehydrate their own bookings
app.post('/api/users/rehydrate-roster', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { users, bookings } = req.body || {};
    const callingUser = req.user;

    // If attempting to restore users array, require admin
    if (Array.isArray(users) && users.length > 0) {
      if (!callingUser || callingUser.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden: Admin access required to rehydrate user accounts.',
        });
      }
    }

    // If student is rehydrating bookings, verify ownership of all items
    let safeBookings = bookings || [];
    if (callingUser && callingUser.role !== 'admin') {
      safeBookings = safeBookings.filter(
        (b: any) =>
          b &&
          (b.studentId === callingUser.id ||
            userStore.normalizeEmail(b.studentEmail) === userStore.normalizeEmail(callingUser.email))
      );
    } else if (!callingUser) {
      // Unauthenticated request cannot inject arbitrary bookings
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
    apiKeyConfigured: hasKey,
    defaultModel: process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-latest',
    googleAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    googleDbStatus: googleDbService.getStatus(),
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

  // Initialize Cloud Backup persistence (Gist / KV / Self-Healing)
  initRemoteBackup().catch((err) => {
    console.warn('[Remote Backup] Initialization notice:', err);
  });

  // Automatically sync authoritative Google Database on startup
  googleDbService.syncFromGoogleDb().catch((err) => {
    console.warn('[Google Database] Startup sync notice:', err);
  });
});
