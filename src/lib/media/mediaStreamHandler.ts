import { NextResponse } from 'next/server';
import fetchUri from '@/lib/arweave/fetchUri';
import buildUpstreamRangeHeader from './buildUpstreamRangeHeader';
import parseHttpContentRange from './parseHttpContentRange';

export type MediaStreamHandlerInput = {
  uri: string;
  rangeHeader: string | null;
};

const mediaStreamHandler = async ({
  uri,
  rangeHeader,
}: MediaStreamHandlerInput) => {
  const rangeRequestValue = buildUpstreamRangeHeader(rangeHeader);

  const upstreamHeaders: Record<string, string> = {
    'Accept-Encoding': 'identity',
  };
  if (rangeRequestValue) {
    upstreamHeaders['Range'] = rangeRequestValue;
  }

  const response = await fetchUri(uri, { headers: upstreamHeaders });

  if (!response.ok && response.status !== 206) {
    return NextResponse.json(
      { error: `Failed to fetch media: ${response.status}` },
      { status: response.status }
    );
  }

  if (!response.body) {
    return NextResponse.json({ error: 'No response body' }, { status: 502 });
  }

  const originHeaders = response.headers ?? new Headers();
  const contentType =
    originHeaders.get('content-type') ?? 'application/octet-stream';

  if (response.status === 206) {
    const cr = parseHttpContentRange(originHeaders.get('content-range'));
    const partLengthHeader = originHeaders.get('content-length');
    const partLength = partLengthHeader ? parseInt(partLengthHeader, 10) : NaN;

    let start: number;
    let end: number;
    let total: number | null;

    if (cr) {
      start = cr.start;
      end = cr.end;
      total = cr.total;
    } else if (rangeRequestValue) {
      const rm = rangeRequestValue.match(/^bytes=(\d+)-(\d+)$/);
      if (!rm) {
        return NextResponse.json(
          { error: 'Invalid partial response' },
          { status: 502 }
        );
      }
      start = parseInt(rm[1], 10);
      end = parseInt(rm[2], 10);
      total = null;
    } else {
      return NextResponse.json(
        { error: 'Invalid partial response' },
        { status: 502 }
      );
    }

    const inferredLength = end - start + 1;
    const contentLength = Number.isFinite(partLength)
      ? partLength
      : inferredLength;

    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    });

    if (total !== null) {
      responseHeaders.set('Content-Range', `bytes ${start}-${end}/${total}`);
    } else {
      responseHeaders.set('Content-Range', `bytes ${start}-${end}/*`);
    }

    return new Response(response.body, {
      status: 206,
      headers: responseHeaders,
    });
  }

  const fullLength = originHeaders.get('content-length');
  const responseHeaders = new Headers({
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
  if (fullLength) {
    responseHeaders.set('Content-Length', fullLength);
  }

  return new Response(response.body, {
    status: 200,
    headers: responseHeaders,
  });
};

export default mediaStreamHandler;
