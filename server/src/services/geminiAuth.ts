import { GoogleGenAI } from '@google/genai';

export interface EphemeralTokenResult {
  token: string;
  expireTime: string;
  newSessionExpireTime: string;
  model: string;
  mintedAt: string;
}

export async function mintEphemeralToken(requestedModel?: string): Promise<EphemeralTokenResult> {
  const rawApiKey = process.env.GEMINI_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : '';

  if (!apiKey || apiKey === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please set your key in server/.env or root .env'
    );
  }

  const model = requestedModel || process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-latest';
  const now = Date.now();
  // Valid for 30 minutes total session lifetime
  const expireTime = new Date(now + 30 * 60 * 1000).toISOString();
  // Allowed 2 minutes window to initiate the WebSocket session
  const newSessionExpireTime = new Date(now + 2 * 60 * 1000).toISOString();

  // Primary approach: Official @google/genai SDK authTokens resource
  try {
    const ai = new GoogleGenAI({ apiKey });

    // The SDK exposes client.authTokens.create for ephemeral tokens
    if (ai.authTokens && typeof ai.authTokens.create === 'function') {
      const response = await ai.authTokens.create({
        config: {
          uses: 1,
          expireTime,
          newSessionExpireTime,
          httpOptions: { apiVersion: 'v1alpha' },
        },
      });

      const tokenValue = (response as { name?: string }).name || String(response);

      return {
        token: tokenValue,
        expireTime,
        newSessionExpireTime,
        model,
        mintedAt: new Date(now).toISOString(),
      };
    }
  } catch (sdkError: unknown) {
    console.warn(
      '[@google/genai SDK authTokens.create failed, falling back to direct REST API endpoint]:',
      sdkError instanceof Error ? sdkError.message : sdkError
    );
  }

  // Resilient Fallback: Direct Google Generative Language REST API endpoint
  const restUrl = 'https://generativelanguage.googleapis.com/v1alpha/auth_tokens';
  const restResponse = await fetch(restUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      uses: 1,
      expireTime,
      newSessionExpireTime,
    }),
  });

  if (!restResponse.ok) {
    const errorBody = await restResponse.text();
    throw new Error(
      `Failed to mint ephemeral token via Gemini API (${restResponse.status} ${restResponse.statusText}): ${errorBody}`
    );
  }

  const restData = (await restResponse.json()) as { name?: string; token?: string };
  const token = restData.name || restData.token;

  if (!token) {
    throw new Error('Gemini API did not return a valid token string');
  }

  return {
    token,
    expireTime,
    newSessionExpireTime,
    model,
    mintedAt: new Date(now).toISOString(),
  };
}
