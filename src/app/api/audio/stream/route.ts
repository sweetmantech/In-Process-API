import { NextRequest, NextResponse } from 'next/server';
import { streamAudio, createStreamHeaders } from '@/lib/streaming/streamAudio';

/**
 * GET /api/audio/stream?url=<audio-url>
 *
 * Streams audio with HTTP Range request support for:
 * - Progressive playback (no full file load required)
 * - Seeking within audio
 * - Resumable downloads
 *
 * Supports ar://, ipfs://, and https:// URLs
 *
 * Headers:
 * - Range: bytes=start-end (optional, for partial content)
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'Missing required parameter: url' },
      { status: 400 }
    );
  }

  try {
    const rangeHeader = req.headers.get('range');
    const result = await streamAudio(url, rangeHeader);
    const headers = createStreamHeaders(result);

    // Return 206 Partial Content for range requests, 200 OK otherwise
    const status = result.isPartial ? 206 : 200;

    return new Response(result.stream, {
      status,
      headers,
    });
  } catch (error: any) {
    console.error('Audio stream error:', error);

    if (error.message === 'Invalid or unsupported URI format') {
      return NextResponse.json(
        { error: 'Invalid or unsupported audio URL format' },
        { status: 400 }
      );
    }

    if (error.message === 'Unable to determine content length') {
      return NextResponse.json(
        { error: 'Unable to stream audio: content length unknown' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to stream audio' },
      { status: 500 }
    );
  }
}

/**
 * HEAD request to check content length and range support
 */
export async function HEAD(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'Missing required parameter: url' },
      { status: 400 }
    );
  }

  try {
    // Use range header with 0-0 to get metadata without full content
    const result = await streamAudio(url, 'bytes=0-0');
    const headers = createStreamHeaders(result);

    return new Response(null, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to get audio metadata' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
