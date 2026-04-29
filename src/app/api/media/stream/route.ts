import { NextRequest, NextResponse } from 'next/server';
import { validateMediaStream } from '@/lib/media/validateMediaStream';
import mediaStreamHandler from '@/lib/media/mediaStreamHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateMediaStream(req);

    if (validated instanceof NextResponse) {
      return validated;
    }

    return mediaStreamHandler(validated);
  } catch (error: any) {
    console.error('Media stream error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to stream media' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
