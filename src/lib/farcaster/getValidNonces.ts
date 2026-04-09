const NONCE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function getValidNonces(): string[] {
  const current = Math.floor(Date.now() / NONCE_WINDOW_MS);
  return [current.toString(), (current - 1).toString()];
}
