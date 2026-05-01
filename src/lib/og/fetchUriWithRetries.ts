import fetchUri from '@/lib/arweave/fetchUri';
import { retriesGeneric } from '@/lib/protocolSdk/retries';

const fetchUriWithRetries = async (url: string): Promise<Response> => {
  try {
    return await retriesGeneric({
      tryFn: async () => {
        const response = await fetchUri(url);
        if (!response.ok) {
          throw new Error(`fetchUri returned ${response.status}`);
        }
        return response;
      },
      maxTries: 2,
      linearBackoffMS: 500,
    });
  } catch (err) {
    throw new Error('failed to get image metadata', { cause: err });
  }
};

export default fetchUriWithRetries;
