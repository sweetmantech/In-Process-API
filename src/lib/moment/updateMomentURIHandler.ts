import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { z } from 'zod';
import { updateMomentURISchema } from '@/lib/schema/updateMomentURISchema';
import { updateMomentURI } from '@/lib/moment/updateMomentURI';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';

type UpdateMomentURIHandlerInput = z.infer<typeof updateMomentURISchema> & {
  artistAddress: string;
};

const updateMomentURIHandler = async ({
  artistAddress,
  moment,
  newUri,
}: UpdateMomentURIHandlerInput): Promise<NextResponse> => {
  const result = await updateMomentURI({
    moment,
    newUri,
    artistAddress: artistAddress as Address,
  });

  migrateMuxToArweave({
    artistAddress: artistAddress as Address,
    moment,
    uri: newUri,
  });

  return NextResponse.json(result);
};

export default updateMomentURIHandler;
