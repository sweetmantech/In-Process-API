import { getFetchableUrl } from '@/lib/protocolSdk/ipfs/gateway';

interface StreamRange {
  start: number;
  end: number | undefined;
}

interface StreamResult {
  stream: ReadableStream<Uint8Array>;
  contentType: string;
  contentLength: number;
  totalSize: number;
  start: number;
  end: number;
  isPartial: boolean;
}

/**
 * Parse HTTP Range header
 * Supports format: bytes=start-end or bytes=start-
 */
export function parseRangeHeader(
  rangeHeader: string | null,
  totalSize: number
): StreamRange | null {
  if (!rangeHeader) return null;

  const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
  if (!match) return null;

  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : undefined;

  if (isNaN(start) || start < 0 || start >= totalSize) {
    return null;
  }

  if (end !== undefined && (isNaN(end) || end < start || end >= totalSize)) {
    return null;
  }

  return { start, end };
}

/**
 * Get content length from upstream without downloading the file
 */
async function getContentLength(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Check if upstream supports range requests
 */
async function checkRangeSupport(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const acceptRanges = response.headers.get('accept-ranges');
    return acceptRanges === 'bytes';
  } catch {
    return false;
  }
}

/**
 * Stream audio with HTTP Range request support
 * Returns partial content (206) when Range header is provided and upstream supports it
 */
export async function streamAudio(
  uri: string,
  rangeHeader: string | null
): Promise<StreamResult> {
  const fetchableUrl = getFetchableUrl(uri);
  if (!fetchableUrl) {
    throw new Error('Invalid or unsupported URI format');
  }

  // Get total file size first
  const totalSize = await getContentLength(fetchableUrl);
  if (!totalSize) {
    throw new Error('Unable to determine content length');
  }

  // Check if upstream supports range requests
  const supportsRange = await checkRangeSupport(fetchableUrl);

  // Parse range if provided
  const range = parseRangeHeader(rangeHeader, totalSize);

  // Determine if we should do a partial request
  const isPartial = !!(range && supportsRange);

  let start = 0;
  let end = totalSize - 1;

  if (isPartial && range) {
    start = range.start;
    end = range.end !== undefined ? range.end : totalSize - 1;
  }

  // Fetch content (with range if supported)
  const headers: HeadersInit = {};
  if (isPartial) {
    headers['Range'] = `bytes=${start}-${end}`;
  }

  const response = await fetch(fetchableUrl, { headers });

  if (!response.ok && response.status !== 206) {
    throw new Error(`Failed to fetch audio: ${response.status}`);
  }

  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';

  // Get the body as a readable stream
  if (!response.body) {
    throw new Error('No response body');
  }

  const contentLength = end - start + 1;

  return {
    stream: response.body,
    contentType,
    contentLength,
    totalSize,
    start,
    end,
    isPartial,
  };
}

/**
 * Create response headers for streaming
 */
export function createStreamHeaders(
  result: StreamResult,
  filename?: string
): Headers {
  const headers = new Headers();

  headers.set('Content-Type', result.contentType);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', result.contentLength.toString());

  if (result.isPartial) {
    headers.set(
      'Content-Range',
      `bytes ${result.start}-${result.end}/${result.totalSize}`
    );
  }

  if (filename) {
    headers.set('Content-Disposition', `inline; filename="${filename}"`);
  }

  // CORS headers for client-side playback
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Range');
  headers.set(
    'Access-Control-Expose-Headers',
    'Content-Range, Content-Length, Accept-Ranges'
  );

  // Cache control
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return headers;
}
