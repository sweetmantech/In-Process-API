import { NextResponse } from 'next/server';
import parseRangeHeader from './parseRangeHeader';

const audioStreamHandler = async ({
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

export default audioStreamHandler;
