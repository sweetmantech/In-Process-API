import { NextResponse } from 'next/server';
import { getFetchableUrl } from '@/lib/protocolSdk/ipfs/gateway';

interface StreamRange {
  start: number;
  end: number | undefined;
}

const parseRangeHeader = (
  rangeHeader: string | null,
  totalSize: number
): StreamRange | null => {
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
};

const getContentInfo = async (url: string) => {
  const response = await fetch(url, { method: 'HEAD' });
  const contentLength = response.headers.get('content-length');
  const acceptRanges = response.headers.get('accept-ranges');
  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';

  return {
    totalSize: contentLength ? parseInt(contentLength, 10) : null,
    supportsRange: acceptRanges === 'bytes',
    contentType,
  };
};

const audioStreamHandler = async ({
  url,
  rangeHeader,
}: {
  url: string;
  rangeHeader: string | null;
}) => {
  const fetchableUrl = getFetchableUrl(url);
  if (!fetchableUrl) {
    return NextResponse.json(
      { error: 'Invalid or unsupported URL format' },
      { status: 400 }
    );
  }

  const { totalSize, supportsRange, contentType } =
    await getContentInfo(fetchableUrl);

  if (!totalSize) {
    return NextResponse.json(
      { error: 'Unable to determine content length' },
      { status: 502 }
    );
  }

  const range = parseRangeHeader(rangeHeader, totalSize);
  const isPartial = !!(range && supportsRange);

  let start = 0;
  let end = totalSize - 1;

  if (isPartial && range) {
    start = range.start;
    end = range.end !== undefined ? range.end : totalSize - 1;
  }

  const headers: HeadersInit = {};
  if (isPartial) {
    headers['Range'] = `bytes=${start}-${end}`;
  }

  const response = await fetch(fetchableUrl, { headers });

  if (!response.ok && response.status !== 206) {
    return NextResponse.json(
      { error: `Failed to fetch audio: ${response.status}` },
      { status: response.status }
    );
  }

  if (!response.body) {
    return NextResponse.json({ error: 'No response body' }, { status: 502 });
  }

  const contentLength = end - start + 1;

  const responseHeaders = new Headers({
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength.toString(),
    'Cache-Control': 'public, max-age=31536000, immutable',
  });

  if (isPartial) {
    responseHeaders.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
  }

  return new Response(response.body, {
    status: isPartial ? 206 : 200,
    headers: responseHeaders,
  });
};

export default audioStreamHandler;
