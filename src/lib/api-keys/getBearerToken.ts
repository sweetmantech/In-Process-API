export function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const lower = authHeader.toLowerCase();
  if (!lower.startsWith('bearer ')) return null;
  const token = authHeader.substring(7).trim();
  return token || null;
}
