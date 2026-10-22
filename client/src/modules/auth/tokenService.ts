import { getApiUrl } from '../../config/api';
import { useAuthStore } from './authStore';

export interface EphemeralTokenPayload {
  token: string;
  expireTime: string;
  newSessionExpireTime: string;
  model: string;
  mintedAt: string;
}

export interface TokenResponse {
  success: boolean;
  data?: EphemeralTokenPayload;
  error?: string;
  message?: string;
}

/**
 * Service to request a short-lived single-use ephemeral token from the Express backend.
 * The backend signs and provisions the token using its server-side GEMINI_API_KEY.
 */
export async function requestEphemeralToken(model?: string): Promise<EphemeralTokenPayload> {
  const url = getApiUrl('/api/token');
  const user = useAuthStore.getState().user;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      userId: user?.id,
      email: user?.email,
    }),
  });

  const json: TokenResponse = await response.json();

  if (!response.ok || !json.success || !json.data) {
    const errorMsg = json.message || json.error || `Failed to fetch token (HTTP ${response.status})`;
    throw new Error(errorMsg);
  }

  return json.data;
}

/**
 * Health check to verify if the server is reachable and if the master API key is present.
 */
export async function checkServerHealth(): Promise<{ status: string; apiKeyConfigured: boolean; defaultModel: string }> {
  const url = getApiUrl('/api/health');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Server health check failed: ${response.statusText}`);
  }
  return response.json();
}
