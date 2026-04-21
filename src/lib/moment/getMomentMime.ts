import fetchUri from '@/lib/arweave/fetchUri';
import { getRetryDelay } from '@/lib/getRetryDelay';

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const getMomentMime = async (uri: string): Promise<string | null> => {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetchUri(uri);
      if (!response.ok) {
        throw new Error(`fetchUri returned ${response.status}`);
      }
      const text = await response.text();
      if (!text) {
        throw new Error('fetchUri returned empty body');
      }
      const data = JSON.parse(text);
      return data?.content?.mime ?? null;
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === MAX_ATTEMPTS - 1;
      if (isLastAttempt) break;
      await sleep(getRetryDelay(error, attempt, BASE_DELAY_MS));
    }
  }

  console.error('getMomentMime: all attempts failed', { uri, lastError });
  return null;
};

export default getMomentMime;
