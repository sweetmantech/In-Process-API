import { retriesGeneric } from '@/lib/protocolSdk/retries';
import deleteFromHereNow from '@/lib/herenow/deleteFromHereNow';

const getBlob = async (url: string) => {
  const response = await retriesGeneric({
    maxTries: 3,
    linearBackoffMS: 2_000,
    tryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return res;
    },
  });

  const type = response.headers.get('content-type') || '';
  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type });
  deleteFromHereNow(url);
  return { blob, type };
};

export default getBlob;
