import { NextRequest, NextResponse } from 'next/server';
import { validateMediaStream } from '@/lib/media/validateMediaStream';
import mediaStreamHandler from '@/lib/media/mediaStreamHandler';
import resolveRedirectableMediaUrl from '@/lib/media/resolveRedirectableMediaUrl';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateMediaStream(req);

    if (validated instanceof NextResponse) {
      return validated;
    }

    const { useProxy, ...streamInput } = validated;

    if (!useProxy) {
      const resolved = await resolveRedirectableMediaUrl(streamInput.uri);
      if (!resolved.ok) {
        return NextResponse.json(
          {
            error: `Origin returned ${resolved.status}: ${resolved.statusText}`,
          },
          { status: resolved.status }
        );
      }
      return NextResponse.redirect(resolved.url, 307);
    }

    return mediaStreamHandler(streamInput);
  } catch (error: any) {
    console.error('Media stream error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to stream media' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
