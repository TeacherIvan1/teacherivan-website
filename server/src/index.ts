import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import tokenRouter from './routes/token.js';
import reportRouter from './routes/report.js';

// Resolve directory paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/token', tokenRouter);
app.use('/api/report', reportRouter);

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
});
