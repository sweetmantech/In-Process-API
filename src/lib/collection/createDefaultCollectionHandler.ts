import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import { z } from 'zod';
import { createCollectionSchema } from '@/lib/schema/createCollectionSchema';
import ensureProcessCollection from '@/lib/collection/ensureProcessCollection';

type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

const createDefaultCollectionHandler = async (
  input: CreateCollectionInput
): Promise<NextResponse> => {
  const collection = await ensureProcessCollection(
    input.account as Address,
    input.chainId
  );
  return NextResponse.json(collection);
};

export default createDefaultCollectionHandler;
