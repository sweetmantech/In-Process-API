import type { ArtistContext } from '@/types/artist';
import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { z } from 'zod';
import { updateMomentURISchema } from '@/lib/schema/updateMomentURISchema';
import { updateMomentURI } from '@/lib/moment/updateMomentURI';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';

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

  migrateMuxToArweave({
    artistAddress: artist.primaryWallet,
    moment: {
      collectionAddress: result.contractAddress,
      tokenId: result.tokenId,
      chainId: result.chainId,
    },
    uri: newUri,
  });

  return NextResponse.json(result);
};

export default updateMomentURIHandler;
