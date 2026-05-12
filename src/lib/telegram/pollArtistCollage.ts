import { CHAIN_ID } from '@/lib/consts';
import { retriesGeneric } from '@/lib/protocolSdk/retries';

const MAX_TRIES = 6;
const LINEAR_BACKOFF_MS = 15_000;

const pollArtistCollage = async (
  artistAddress: string
): Promise<Buffer | null> => {
  const url = `https://in-process-api.vercel.app/api/og/artist/collage?artistAddress=${encodeURIComponent(artistAddress)}&chainId=${CHAIN_ID}`;

  try {
    return await retriesGeneric({
      tryFn: async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('OG collage not ready');
        return Buffer.from(await res.arrayBuffer());
      },
      maxTries: MAX_TRIES,
      linearBackoffMS: LINEAR_BACKOFF_MS,
    });
  } catch (e) {
    console.error('[pollArtistCollage] gave up after retries:', e);
    return null;
  }
};

export default pollArtistCollage;
