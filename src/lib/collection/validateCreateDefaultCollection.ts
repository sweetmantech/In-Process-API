import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import {
  CHAIN_ID,
  PROCESS_COLLECTION_NAME,
  PROCESS_COLLECTION_URI,
} from '@/lib/consts';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { createCollectionSchema } from '@/lib/schema/createCollectionSchema';
import { z } from 'zod';

type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

const validateCreateDefaultCollection = async (
  req: NextRequest
): Promise<CreateCollectionInput | NextResponse> => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const existingCollections = await selectCollections({
    artist: authResult.primaryWallet,
    uri: PROCESS_COLLECTION_URI,
    chainId: CHAIN_ID,
    limit: 1,
  });
  if (existingCollections.length > 0) {
    return NextResponse.json(
      { message: 'Process collection already created' },
      { status: 200 }
    );
  }

  return {
    account: authResult.primaryWallet,
    collection: {
      uri: PROCESS_COLLECTION_URI,
      name: PROCESS_COLLECTION_NAME,
    },
    chainId: CHAIN_ID,
  };
};

export default validateCreateDefaultCollection;
