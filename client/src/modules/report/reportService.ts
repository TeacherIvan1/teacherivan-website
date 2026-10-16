import {
  ReportRequestPayload,
  ReportApiResponse,
  SessionReport,
  ReportStats,
} from './types';
import { getApiUrl } from '../../config/api';

/**
 * Validates that an object conforms to the SessionReport interface.
 */
export function validateSessionReport(data: unknown): data is SessionReport {
  if (!data || typeof data !== 'object') return false;

  const r = data as Partial<SessionReport>;

  if (typeof r.id !== 'string' || r.id.trim() === '') return false;
  if (typeof r.summary !== 'string' || r.summary.trim() === '') return false;
  if (!Array.isArray(r.strengths)) return false;
  if (!Array.isArray(r.topErrors)) return false;

  for (const err of r.topErrors) {
    if (
      !err ||
      typeof err.original !== 'string' ||
      typeof err.corrected !== 'string' ||
      typeof err.explanation !== 'string'
    ) {
      return false;
    }
  }

  if (!Array.isArray(r.vocabularyUsed)) return false;
  if (typeof r.nextExercise !== 'string' || r.nextExercise.trim() === '') return false;

  if (
    !r.stats ||
    typeof r.stats.durationSeconds !== 'number' ||
    typeof r.stats.learnerTurns !== 'number' ||
    typeof r.stats.learnerWords !== 'number'
  ) {
    return false;
  }

  return true;
}

/**
 * Calculates client-side conversational stats.
 */
export function calculateClientStats(
  turns: Array<{ role: 'user' | 'assistant'; content: string }>,
  durationSeconds: number
): ReportStats {
  const learnerTurns = turns.filter((t) => t.role === 'user');
  let learnerWords = 0;
  for (const turn of learnerTurns) {
    const words = turn.content.trim().split(/\s+/).filter(Boolean);
    learnerWords += words.length;
  }

  const durationMin = Math.max(0.1, durationSeconds / 60);
  const estimatedWpm = Math.round(learnerWords / durationMin);

  const roundedSecs = Math.max(0, Math.round(durationSeconds));
  const mins = Math.floor(roundedSecs / 60);
  const secs = roundedSecs % 60;
  const durationFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return {
    durationSeconds: roundedSecs,
    durationFormatted,
    learnerTurns: learnerTurns.length,
    learnerWords,
    estimatedWpm,
  };
}

/**
 * Checks whether the session was too short to produce an analytical report.
 */
export function isSessionTooShort(learnerTurns: number, learnerWords: number): boolean {
  return learnerTurns < 2 || learnerWords < 8;
}

/**
 * Sends the transcript to the Express backend endpoint (/api/report)
 * with automatic 1-time retry on invalid JSON or network glitch.
 */
export async function requestReportGeneration(
  payload: ReportRequestPayload,
  isRetry: boolean = false
): Promise<ReportApiResponse> {
  try {
    const url = getApiUrl('/api/report');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json: ReportApiResponse = await response.json();

    if (response.status === 429 || json.rateLimited) {
      return {
        success: false,
        rateLimited: true,
        error: json.error || 'Gemini API rate limit reached. Please wait a few seconds and retry.',
      };
    }

    if (!response.ok || !json.success) {
      throw new Error(json.error || `Server returned error status ${response.status}`);
    }

    // If session was too short
    if (json.tooShort) {
      return json;
    }

    // Validate the report structure
    if (!json.report || !validateSessionReport(json.report)) {
      throw new Error('Received invalid report payload structure from server');
    }

    return json;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Automatic 1-time retry on validation error or transient glitch
    if (!isRetry) {
      console.warn(`[ReportService] Request failed: ${errorMsg}. Retrying once...`);
      await new Promise((r) => setTimeout(r, 1200));
      return requestReportGeneration(payload, true);
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}
