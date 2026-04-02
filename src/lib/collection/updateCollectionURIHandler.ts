import { Address } from 'viem';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateCollectionURISchema } from '@/lib/schema/updateCollectionURISchema';
import { updateCollectionURI } from '@/lib/collection/updateCollectionURI';

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
  return NextResponse.json(result);
};

export default updateCollectionURIHandler;
