import { NextRequest } from 'next/server';
import validateSoundUpdateTierMetadata from '@/lib/sound/validateSoundUpdateTierMetadata';
import updateSoundTierMetadataHandler from '@/lib/sound/updateSoundTierMetadataHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateSoundUpdateTierMetadata(req);
    if (validated instanceof Response) return validated;
    return await updateSoundTierMetadataHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'failed to update sound tier metadata' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
