import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCollectionSchema } from '@/lib/schema/createCollectionSchema';
import { createCollection } from '@/lib/collection/createCollection';

type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

const createCollectionHandler = async (
  input: CreateCollectionInput
): Promise<NextResponse> => {
  const result = await createCollection(input);
  return NextResponse.json(result);
};

export default createCollectionHandler;
