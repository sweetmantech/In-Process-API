import fetchUri from '@/lib/arweave/fetchUri';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';
import { retriesGeneric } from '@/lib/protocolSdk/retries';

const getMetadataHandler = async ({ uri }: { uri: string }) =>
  retriesGeneric({
    maxTries: 3,
    linearBackoffMS: 2_000,
    tryFn: async () => {
      const response = await fetchUri(uri, { cache: 'no-store' });
      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : JSON.parse(await response.text());
      return normalizeMetadata(data);
    },
  });

export default getMetadataHandler;
