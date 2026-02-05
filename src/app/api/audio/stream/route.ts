import { NextRequest, NextResponse } from 'next/server';
import { validateAudioStream } from '@/lib/audio/validateAudioStream';
import audioStreamHandler from '@/lib/audio/audioStreamHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateAudioStream(req);

    if (validated instanceof NextResponse) {
      return validated;
    }

    return audioStreamHandler(validated);
  } catch (error: any) {
    console.error('Audio stream error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to stream audio' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
