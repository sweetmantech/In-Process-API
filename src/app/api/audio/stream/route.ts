import { NextRequest, NextResponse } from 'next/server';
import { validateAudioStreamParam } from '@/lib/audio/validateAudioStreamParam';
import audioStreamHandler from '@/lib/audio/audioStreamHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateAudioStreamParam(req);

    if (validated instanceof NextResponse) {
      return validated;
    }

    const { url, rangeHeader } = validated;

    return audioStreamHandler({ url, rangeHeader });
  } catch (error: any) {
    console.error('Audio stream error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to stream audio' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
