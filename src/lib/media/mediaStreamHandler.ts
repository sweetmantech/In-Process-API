import { NextResponse } from 'next/server';
import parseRangeHeader from './parseRangeHeader';

const mediaStreamHandler = async ({
  fetchableUrl,
  totalSize,
  supportsRange,
  contentType,
  rangeHeader,
}: {
  fetchableUrl: string;
  totalSize: number;
  supportsRange: boolean;
  contentType: string;
  rangeHeader: string | null;
}) => {
  const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  const range = parseRangeHeader(rangeHeader, totalSize);
  const isPartial = !!(range && supportsRange);

  let start = 0;
  let end = totalSize - 1;

  if (isPartial && range) {
    start = range.start;
    const cappedEnd = Math.min(start + MAX_CHUNK_SIZE - 1, totalSize - 1);
    end = range.end !== undefined ? range.end : cappedEnd;
  }

  const headers: HeadersInit = {};
  if (isPartial) {
    headers['Range'] = `bytes=${start}-${end}`;
  }

  const response = await fetch(fetchableUrl, { headers });

  if (!response.ok && response.status !== 206) {
    return NextResponse.json(
      { error: `Failed to fetch media: ${response.status}` },
      { status: response.status }
    );
  }

  if (!response.body) {
    return NextResponse.json({ error: 'No response body' }, { status: 502 });
  }

  const actuallyPartial = isPartial && response.status === 206;

  if (!actuallyPartial) {
    start = 0;
    end = totalSize - 1;
  }

  const contentLength = end - start + 1;

  const responseHeaders = new Headers({
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength.toString(),
    'Cache-Control': 'public, max-age=31536000, immutable',
  });

  if (actuallyPartial) {
    responseHeaders.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
  }

  return new Response(response.body, {
    status: actuallyPartial ? 206 : 200,
    headers: responseHeaders,
  });
};

export default mediaStreamHandler;
