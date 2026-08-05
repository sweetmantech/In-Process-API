import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import { z } from 'zod';
import { PROCESS_COLLECTION_URI } from '@/lib/consts';
import { createCollectionSchema } from '@/lib/schema/createCollectionSchema';
import createCollectionHandler from '@/lib/collection/createCollectionHandler';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { withProcessCollectionCreateLock } from '@/lib/collection/withProcessCollectionCreateLock';

type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

const alreadyCreatedResponse = () =>
  NextResponse.json(
    { message: 'Process collection already created' },
    { status: 200 }
  );

const createDefaultCollectionHandler = async (
  input: CreateCollectionInput
): Promise<NextResponse> => {
  return withProcessCollectionCreateLock(
    input.account as Address,
    input.chainId,
    async () => {
      const existingCollections = await selectCollections({
        artist: input.account,
        uri: PROCESS_COLLECTION_URI,
        chainId: input.chainId,
        limit: 1,
      });
      if (existingCollections.length > 0) {
        return alreadyCreatedResponse();
      }
      return createCollectionHandler(input);
    }
  );
};

export default createDefaultCollectionHandler;
