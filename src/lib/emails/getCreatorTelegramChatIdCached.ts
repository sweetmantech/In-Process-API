import lookupArtistTelegramChatId from '@/lib/emails/lookupArtistTelegramChatId';

export default async function getCreatorTelegramChatIdCached({
  creatorAddress,
  cache,
}: {
  creatorAddress: string;
  cache: Map<string, string | null>;
}): Promise<string | null> {
  const key = creatorAddress.toLowerCase();
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const telegramChatId = await lookupArtistTelegramChatId(creatorAddress);
    cache.set(key, telegramChatId);
    return telegramChatId;
  } catch (e) {
    console.error('[collect-telegram] creator chat lookup failed:', e);
    cache.set(key, null);
    return null;
  }
}
