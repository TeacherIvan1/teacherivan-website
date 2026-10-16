---
trigger: always_on
---

# Project rules
- Goal: browser prototype of a real-time voice English tutor.
- Stack: React + Vite + TypeScript + Zustand; tiny Node/Express server.
- Voice: Gemini Live API, native audio. Do NOT build separate STT/TTS.
- Always read the CURRENT official Gemini Live API docs before writing code; don't assume model names, audio formats, or SDK methods.
- The API key lives only in server .env. The browser gets short-lived tokens from the server. Never commit .env.
- Keep conversation state, teaching state, and audio code in separate modules.
- No paid services, no billing.