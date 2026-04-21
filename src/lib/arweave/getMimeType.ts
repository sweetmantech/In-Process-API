import fetchUri from '@/lib/arweave/fetchUri';

/**
 * Sends a HEAD request to the given URI and returns the MIME type
 * (without charset or other parameters), or null if unavailable.
 */
const getMimeType = async (uri: string): Promise<string | null> => {
  try {
    const res = await fetchUri(uri, { method: 'HEAD' });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    return contentType ? contentType.split(';')[0].trim() : null;
  } catch {
    return null;
  }
};

export default getMimeType;
