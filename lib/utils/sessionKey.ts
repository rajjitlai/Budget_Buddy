/**
 * In-memory session store for the user's AI API key on web.
 *
 * On web, the API key is never written to localStorage (plaintext persistence);
 * it lives only in this in-memory value for the duration of the session.
 * Native platforms persist it via expo-secure-store instead.
 */
let sessionApiKey = '';

export function setSessionApiKey(value: string): void {
  sessionApiKey = value;
}

export function getSessionApiKey(): string {
  return sessionApiKey;
}
