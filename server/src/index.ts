import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import tokenRouter from './routes/token.js';
import reportRouter from './routes/report.js';
import authRouter from './routes/auth.js';
import bookingRouter from './routes/bookings.js';
import curriculumRouter from './routes/curriculum.js';
import { userStore } from './services/userStore.js';
import { bookingStore } from './services/bookingStore.js';
import { initRemoteBackup } from './services/remoteBackup.js';

// Resolve directory paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Allowed CORS origins
const allowedOrigins = [
  'https://teacherivan.com',
  'http://teacherivan.com',
  'https://www.teacherivan.com',
  'http://www.teacherivan.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, Render health checks)
      if (!origin) {
        return callback(null, true);
      }

      // Check explicitly permitted origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any custom domain or environment override if configured
      if (
        process.env.ALLOWED_ORIGINS &&
        process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).includes(origin)
      ) {
        return callback(null, true);
      }

      // Also allow github.io preview domains or internal onrender domains
      if (origin.endsWith('.github.io') || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      // Allow origin reflection for development and non-listed clients
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(express.json());

// Routes
app.use('/api/token', tokenRouter);
app.use('/api/report', reportRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/curriculum', curriculumRouter);

// GET /api/users/export
app.get('/api/users/export', (_req, res) => {
  const users = userStore.getAllUsers();
  res.status(200).json({
    status: 'ok',
    total: users.length,
    users,
  });
});

// POST /api/users/rehydrate-roster (Admin Roster Vault auto-recovery)
app.post('/api/users/rehydrate-roster', (req, res) => {
  try {
    const { users, bookings } = req.body || {};
    const mergedUsers = userStore.rehydrateRoster(users || []);
    const mergedBookings = bookingStore.rehydrateBookings(bookings || []);

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

// PUT /api/users/:id/plan (Admin manual plan update)
app.put('/api/users/:id/plan', (req, res) => {
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
});
