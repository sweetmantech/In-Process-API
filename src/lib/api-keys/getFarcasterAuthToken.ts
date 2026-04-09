export function getFarcasterAuthToken(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;
  const lower = authHeader.toLowerCase();
  if (!lower.startsWith('farcaster ')) return null;
  return authHeader.substring(10);
}
