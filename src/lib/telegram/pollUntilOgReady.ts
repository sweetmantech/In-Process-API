import { CHAIN_ID } from '@/lib/consts';
import { retriesGeneric } from '@/lib/protocolSdk/retries';

const MAX_TRIES = 6;
const LINEAR_BACKOFF_MS = 15_000;

const pollUntilOgReady = async (
  contractAddress: string,
  tokenId: string
): Promise<void> => {
  const url = `https://in-process-api.vercel.app/api/og/moment?tokenId=${tokenId}&collectionAddress=${contractAddress}&chainId=${CHAIN_ID}`;

  try {
    await retriesGeneric({
      tryFn: async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('OG not ready');
      },
      maxTries: MAX_TRIES,
      linearBackoffMS: LINEAR_BACKOFF_MS,
    });
  } catch {
    // timed out — send message anyway
  }
};

export default pollUntilOgReady;
