# Gemini Live Voice English Tutor (Prototype)

A browser prototype for a real-time voice English tutor built with **React**, **Vite**, **TypeScript**, **Zustand**, and a lightweight **Node/Express** backend that securely mints short-lived ephemeral tokens for the **Gemini Live API**.

---

## 🌟 Architecture & Security Overview

In direct client-to-model architectures like the Gemini Live API (WebSockets), bundling a master API key in the frontend is a severe security vulnerability. This project follows the official Google AI security pattern:

1. **Server-Side Key Isolation**: The permanent `GEMINI_API_KEY` lives **exclusively** on the Node/Express backend (`.env`) and is never committed to Git or sent to the browser.
2. **Ephemeral Token Minting Service**: When the user initiates a session, the frontend requests a short-lived token from `POST /api/token`. The backend uses the official `@google/genai` SDK (`client.authTokens.create`) to mint a temporary, single-use token (`uses: 1`, 30-minute absolute TTL, 2-minute connection window).
3. **Modular Frontend Architecture**:
   - `modules/conversation`: Manages session lifecycle, active connection state, duration timers, and conversation messages via Zustand.
   - `modules/teaching`: Manages English learning objectives, learner proficiency levels (Beginner, Intermediate, Advanced), conversation scenarios, and vocabulary/grammar targets.
   - `modules/audio`: Clean audio pipeline module boundary and interface stub, reserved for Gemini Live native PCM audio streaming in Phase 2.
   - `modules/auth`: Client communication with the backend token minting service.

---

## 📁 Project Structure

```
Converstion Project/
├── .env.example                  # Root environment variables template
├── .gitignore                    # Ensures .env, node_modules, and dist are never committed
├── package.json                  # Root package orchestrating server & client workspaces
├── README.md                     # Documentation and run instructions
│
├── server/                       # Node/Express Backend
│   ├── .env.example              # Server environment template
│   ├── package.json              # Server dependencies: express, cors, dotenv, @google/genai, tsx
│   ├── tsconfig.json             # TypeScript configuration for Node
│   └── src/
│       ├── index.ts              # Express server entry point (port 3001) & /api/health
│       ├── routes/
│       │   └── token.ts          # /api/token route for minting ephemeral tokens
│       └── services/
│           └── geminiAuth.ts     # @google/genai SDK authTokens wrapper with REST fallback
│
└── client/                       # Vite React TypeScript Frontend
    ├── package.json              # Client dependencies: react, react-dom, zustand, lucide-react
    ├── tsconfig.json             # TypeScript configuration
    ├── vite.config.ts            # Vite config with /api reverse-proxy to Express (port 3001)
    ├── index.html                # HTML template with Google Fonts (Outfit & Inter)
    └── src/
        ├── index.css             # Vanilla CSS design system (dark glassmorphism, glowing micro-animations)
        ├── main.tsx              # React entry point
        ├── App.tsx               # Main layout
        ├── components/
        │   ├── Header.tsx        # Top status bar (Server health & security badge)
        │   ├── TutorControls.tsx # Interactive Start / Stop session button & metrics
        │   ├── TeachingCard.tsx  # Curriculum selector (Level, topics, target vocabulary)
        │   ├── SessionFeed.tsx   # Activity stream & system event log
        │   └── TokenInspector.tsx# Live diagnostics displaying the minted ephemeral token
        └── modules/
            ├── auth/             # Token service client
            ├── conversation/     # Zustand conversation & session store
            ├── teaching/         # Zustand curriculum & tutoring store
            └── audio/            # Audio manager stub interface (ready for Phase 2)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- A free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
From the project root directory, install all dependencies for both the server and client in one command:

```bash
npm install
```

*(This automatically installs workspace dependencies for both `server` and `client` using npm workspaces.)*

### 3. Configure the Environment
Create your `.env` file for the backend server:

```bash
# On Windows PowerShell:
Copy-Item .env.example server/.env

# Or on Bash:
cp .env.example server/.env
```

Open `server/.env` and insert your Gemini API Key:
```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
PORT=3001
GEMINI_LIVE_MODEL=gemini-2.5-flash
```

> **Note:** If you run without a `GEMINI_API_KEY`, the server will start up normally and report the key as missing. When you click **Start Practice Session**, the UI will cleanly notify you with an error message instructing you to add your key to `.env`.

### 4. Running the Development Server
Run both the Express server and Vite frontend concurrently:

```bash
npm run dev
```

Alternatively, run each service in separate terminals:
- **Backend Server**: `npm run dev:server` (runs on `http://localhost:3001`)
- **Frontend App**: `npm run dev:client` (runs on `http://localhost:5173`)

### 5. Access the App
Open your browser to:
```
http://localhost:5173
```

---

## 🧪 Testing the Prototype

1. **Verify Backend Connection**:
   - The top navigation bar displays the **Server** status (`Online`) and **Key** status (`Guarded`).
2. **Start a Session**:
   - Click the **Start Practice Session** button.
   - The button transitions into a loading state while requesting `POST /api/token`.
   - The backend mints a short-lived ephemeral token using the official `@google/genai` SDK.
   - Upon receiving the token, the UI transitions to **Connected / Live State**, the session timer starts, and the **Ephemeral Token Inspector** reveals the newly minted token, single-use constraint, and expiration timestamps.
3. **Inspect Ephemeral Token Diagnostics**:
   - Use the **Token Inspector** panel on the right to examine the token string, copy it, or view the 2-minute connection window and 30-minute maximum session lifespan.
4. **Stop Session**:
   - Click **Stop Session** to end the active session.
   - The activity log records the session termination and invalidates the active state.
5. **Switch Learning Scenarios**:
   - Toggle between **Beginner**, **Intermediate**, and **Advanced** levels or select topics such as *Airport Check-In*, *Job Interview*, or *Casual Small Talk* to inspect the modular teaching store.

---

---

## 🎙️ Live Audio & Real-Time Transcriptions Architecture

The application implements full bidirectional audio and speech transcription directly with the **Gemini Live API**:

1. **AudioWorklet Microphone Capture (`modules/audio/audioManager.ts` & `audioWorkletProcessorCode.ts`)**:
   - Captures microphone audio using an `AudioWorkletNode` executing on the audio rendering thread to prevent main-thread stuttering.
   - Automatically resamples input from any hardware audio rate (e.g., 44.1kHz, 48kHz) down to the official Gemini Live audio specification: **16,000 Hz linear PCM 16-bit little-endian mono** (`audio/pcm;rate=16000`).
   - Buffers and emits chunks of 2,048 samples (~128ms) encoded as base64 within `realtimeInput.mediaChunks`.
   - Computes real-time RMS microphone levels for visual audio metering.

2. **Queued Audio Player (`modules/audio/queuedAudioPlayer.ts`)**:
   - Decodes returning **24,000 Hz 16-bit PCM little-endian mono** audio responses from `serverContent.modelTurn.parts` (`audio/pcm;rate=24000`).
   - Schedules seamless, gapless playback on the Web Audio API timeline (`AudioContext.currentTime`).
   - Features instantaneous cutoff and queue flushing on **barge-in / interruption** (`serverContent.interrupted`), ensuring the tutor stops speaking immediately when the learner speaks over her.

3. **Bidirectional Speech Transcription & Chat Transcript (`components/ChatTranscript.tsx`)**:
   - The setup handshake enables both `inputAudioTranscription: {}` and `outputAudioTranscription: {}`.
   - Incoming user speech transcriptions (`serverContent.inputTranscription.text`) and model response transcriptions (`serverContent.outputTranscription.text`) are streamed word-by-word into a chat-style transcript interface with live streaming cursor indicators.
   - Supports hybrid voice and text inputs with microphone muting and transcript clearing.

