import { NextRequest } from 'next/server';
import validateSoundUpdateEditionMetadata from '@/lib/sound/validateSoundUpdateEditionMetadata';
import updateSoundEditionMetadataHandler from '@/lib/sound/updateSoundEditionMetadataHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateSoundUpdateEditionMetadata(req);
    if (validated instanceof Response) return validated;
    return await updateSoundEditionMetadataHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'failed to update sound edition metadata' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
