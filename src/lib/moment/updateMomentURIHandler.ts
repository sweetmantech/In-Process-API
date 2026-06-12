import type { ArtistContext } from '@/types/artist';
import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { z } from 'zod';
import { updateMomentURISchema } from '@/lib/schema/updateMomentURISchema';
import { updateMomentURI } from '@/lib/moment/updateMomentURI';

type UpdateMomentURIHandlerInput = z.infer<typeof updateMomentURISchema> & {
  artist: ArtistContext;
};

const updateMomentURIHandler = async ({
  artist,
  moment,
  newUri,
  newCollectionAddress,
}: UpdateMomentURIHandlerInput): Promise<NextResponse> => {
  const result = await updateMomentURI({
    moment,
    newUri,
    newCollectionAddress,
    artist,
  });

  return NextResponse.json(result);
};

export default updateMomentURIHandler;
