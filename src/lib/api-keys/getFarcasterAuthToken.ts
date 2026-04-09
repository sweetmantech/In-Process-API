export function getFarcasterAuthToken(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;
  const lower = authHeader.toLowerCase();
  if (!lower.startsWith('farcaster ')) return null;
  const token = authHeader.substring(10).trim();
  return token || null;
}
