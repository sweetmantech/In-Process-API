import { getArweaveGateway } from '@/lib/arweave/wayfinderClient';
import { isArweaveURL } from './arweave';
import { isNormalizeableIPFSUrl, normalizeIPFSUrl } from './ipfs';

const IPFS_GATEWAY = 'https://magic.decentralized-content.com';

export function ipfsGatewayUrl(url: string | null) {
  if (!url || typeof url !== 'string') return null;
  const normalizedIPFSUrl = normalizeIPFSUrl(url);
  if (normalizedIPFSUrl) {
    return normalizedIPFSUrl.replace('ipfs://', `${IPFS_GATEWAY}/ipfs/`);
  }
  return null;
}

export async function getFetchableUrl(
  uri: string | null | undefined
): Promise<string | null> {
  if (!uri || typeof uri !== 'string') return null;

  // Prevent fetching from insecure URLs
  if (uri.startsWith('http://')) return null;

  // If it is an IPFS HTTP or ipfs:// url
  if (isNormalizeableIPFSUrl(uri)) {
    // Return a fetchable gateway url
    return ipfsGatewayUrl(uri);
  }

  // If it is a ar:// url
  if (isArweaveURL(uri)) {
    // Resolve via Wayfinder for dynamic gateway selection
    const gateway = await getArweaveGateway();
    return uri.replace('ar://', `${gateway.origin}/`);
  }

  // If it is already a url (or blob or data-uri)
  if (/^(https|data|blob):/.test(uri)) {
    // Return the URI
    return uri;
  }

  return null;
}
