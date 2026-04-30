import fetchUri from '@/lib/arweave/fetchUri';
import { getRetryDelay } from '@/lib/getRetryDelay';
import sleep from '@/lib/sleep';

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

const fetchUriWithRetries = async (url: string): Promise<Response> => {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetchUri(url);
      if (!response.ok) {
        throw new Error(`fetchUri returned ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === MAX_ATTEMPTS - 1;
      if (isLastAttempt) break;
      await sleep(getRetryDelay(error, attempt, BASE_DELAY_MS));
    }
  }

  throw new Error('failed to get image metadata', { cause: lastError });
};

export default fetchUriWithRetries;
