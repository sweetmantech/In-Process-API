import lookupArtistEmail from '@/lib/emails/lookupArtistEmail';

export default async function getCreatorEmailCached({
  creatorAddress,
  cache,
}: {
  creatorAddress: string;
  cache: Map<string, string | null>;
}): Promise<string | null> {
  const key = creatorAddress.toLowerCase();
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const email = await lookupArtistEmail(creatorAddress);
    cache.set(key, email);
    return email;
  } catch (e) {
    console.error('[resend] creator email lookup failed:', e);
    cache.set(key, null);
    return null;
  }
}
