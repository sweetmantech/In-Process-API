import { unstable_cache } from 'next/cache';
import fetchUri from '@/lib/arweave/fetchUri';

export type ArweaveRedirectResult =
  | { ok: true; url: string }
  | { ok: false; status: number; statusText: string };

const fetchArweaveRedirectTarget = async (
  uri: string
): Promise<ArweaveRedirectResult> => {
  const response = await fetchUri(uri, {
    method: 'HEAD',
    redirect: 'follow',
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      statusText: response.statusText,
    };
  }

  const finalUrl = response.url;
  if (!finalUrl?.startsWith('https://')) {
    return {
      ok: false,
      status: 502,
      statusText: 'Could not resolve to an HTTPS URL',
    };
  }

  return { ok: true, url: finalUrl };
};

/**
 * Caches Wayfinder/gateway resolution for `ar://` URLs to avoid a HEAD on every request.
 */
const resolveArweaveRedirectUrlCached = (
  uri: string
): Promise<ArweaveRedirectResult> =>
  unstable_cache(
    () => fetchArweaveRedirectTarget(uri),
    ['media-stream-ar-redirect', uri],
    { revalidate: 300 }
  )();

export default resolveArweaveRedirectUrlCached;
