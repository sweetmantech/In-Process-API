import type { ArtistContext } from '@/types/artist';
import { Address } from 'viem';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateCollectionURISchema } from '@/lib/schema/updateCollectionURISchema';
import { updateCollectionURI } from '@/lib/collection/updateCollectionURI';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';

type UpdateCollectionURIHandlerInput = z.infer<
  typeof updateCollectionURISchema
> & {
  artist: ArtistContext;
};

const updateCollectionURIHandler = async ({
  artist,
  collection,
  newUri,
  newCollectionName,
}: UpdateCollectionURIHandlerInput): Promise<NextResponse> => {
  const result = await updateCollectionURI({
    collection,
    newUri,
    newCollectionName,
    artist,
  });

  migrateMuxToArweave({
    artistAddress: artist.primaryWallet,
    moment: {
      collectionAddress: collection.address,
      tokenId: '0',
      chainId: collection.chainId,
    },
    uri: newUri,
  });

  return NextResponse.json(result);
};

export default updateCollectionURIHandler;
