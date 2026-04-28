import { isArweaveURL } from '@/lib/protocolSdk/ipfs/arweave';
import { getFetchableUrl } from '@/lib/protocolSdk/ipfs/gateway';
import resolveArweaveRedirectUrlCached from './resolveArweaveRedirectUrlCached';

export type ResolveRedirectableMediaUrlResult =
  | { ok: true; url: string }
  | { ok: false; status: number; statusText: string };

/** Resolves a video URI to an absolute HTTPS URL for a 307 redirect. */
const resolveRedirectableMediaUrl = async (
  uri: string
): Promise<ResolveRedirectableMediaUrlResult> => {
  if (uri.startsWith('http://')) {
    return { ok: false, status: 400, statusText: 'Insecure URL' };
  }

  if (uri.startsWith('https://')) {
    return { ok: true, url: uri };
  }

  const ipfsOrHttps = getFetchableUrl(uri);
  if (ipfsOrHttps) {
    return { ok: true, url: ipfsOrHttps };
  }

  if (isArweaveURL(uri)) {
    return resolveArweaveRedirectUrlCached(uri);
  }

  return {
    ok: false,
    status: 400,
    statusText: 'Unsupported URL for redirect',
  };
};

export default resolveRedirectableMediaUrl;
