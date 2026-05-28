import type { ArtistContext } from '@/types/artist';
import { Address } from 'viem';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateCollectionURIBodySchema } from '@/lib/schema/updateCollectionURIBodySchema';
import { updateCollectionURI } from '@/lib/collection/updateCollectionURI';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';

type UpdateCollectionURIHandlerInput = z.infer<
  typeof updateCollectionURIBodySchema
> & {
  artist: ArtistContext;
  collection: { address: Address; chainId: number };
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
