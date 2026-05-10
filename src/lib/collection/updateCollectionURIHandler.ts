import { Address } from 'viem';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateCollectionURISchema } from '@/lib/schema/updateCollectionURISchema';
import { updateCollectionURI } from '@/lib/collection/updateCollectionURI';
import migrateMuxToArweave from '@/workflows/migrateMuxToArweave';

type UpdateCollectionURIHandlerInput = z.infer<
  typeof updateCollectionURISchema
> & {
  artistAddress: string;
};

const updateCollectionURIHandler = async ({
  artistAddress,
  collection,
  newUri,
  newCollectionName,
}: UpdateCollectionURIHandlerInput): Promise<NextResponse> => {
  const result = await updateCollectionURI({
    collection,
    newUri,
    newCollectionName,
    artistAddress: artistAddress as Address,
  });

  migrateMuxToArweave({
    artistAddress: artistAddress as Address,
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
