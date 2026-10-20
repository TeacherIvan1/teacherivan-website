/**
 * Transcript Cleaner & Phonetic Normalizer
 * -------------------------------------------------------------
 * Provides:
 * 1. cleanTranscript: Corrects common STT phonetic slips, acoustic misinterpretations,
 *    and brand variations before rendering transcript bubbles and before report evaluation.
 * 2. mergeTranscriptionChunks: Performs robust overlap-aware chunk accumulation
 *    so all incoming inputTranscription fragments within a turn are cleanly preserved
 *    without dropping trailing characters or cutting words.
 */

/**
 * Corrects common STT phonetic slips and brand terms for the Teacher Ivan platform.
 */
export function cleanTranscript(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Official Brand Lockup & Teacher Ivan variants
  cleaned = cleaned.replace(/teacher\s+english\s+classes/gi, 'Teacher Ivan English Classes');
  cleaned = cleaned.replace(/teacher\s+i\s+van\b/gi, 'Teacher Ivan');
  cleaned = cleaned.replace(/teacher\s+evan\b/gi, 'Teacher Ivan');
  cleaned = cleaned.replace(/teacher\s+iban\b/gi, 'Teacher Ivan');
  cleaned = cleaned.replace(/tutor\s+ivan\b/gi, 'Teacher Ivan');
  cleaned = cleaned.replace(/profe\s+ivan\b/gi, 'Teacher Ivan');

  // 2. Geographic & City context (Sucre, Bolivia)
  cleaned = cleaned.replace(/\bsukra\b/gi, 'Sucre');
  cleaned = cleaned.replace(/\bsucre\s+bolivia\b/gi, 'Sucre, Bolivia');
  cleaned = cleaned.replace(/\bplaza\s+25\s+de\s+mayo\b/gi, 'Plaza 25 de Mayo');

  // 3. Methodology & Acoustic terms
  cleaned = cleaned.replace(/\bbichronous\b/gi, 'bichronous');

  return cleaned;
}

/**
 * Merges an incoming transcription chunk with existing interim text
 * while preserving all characters and resolving STT stream overlaps.
 */
export function mergeTranscriptionChunks(existing: string, incoming: string): string {
  if (!existing) return incoming;
  if (!incoming) return existing;

  // If incoming already contains the entire existing text as a prefix
  if (incoming.startsWith(existing)) {
    return incoming;
  }

  // If existing already ends with incoming
  if (existing.endsWith(incoming)) {
    return existing;
  }

  // Check for partial suffix-to-prefix overlap between existing and incoming
  const maxOverlap = Math.min(existing.length, incoming.length);
  for (let k = maxOverlap; k > 0; k--) {
    if (existing.slice(-k) === incoming.slice(0, k)) {
      return existing + incoming.slice(k);
    }
  }

  // Handle word boundary spacing if no direct overlap exists
  return existing + incoming;
}
