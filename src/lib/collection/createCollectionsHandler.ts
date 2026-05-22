import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCollectionsSchema } from '@/lib/schema/createCollectionsSchema';
import { createCollections } from '@/lib/collection/createCollections';

type CreateCollectionsInput = z.infer<typeof createCollectionsSchema>;

const createCollectionsHandler = async (
  input: CreateCollectionsInput
): Promise<NextResponse> => {
  const results = await createCollections(input);
  return NextResponse.json(results);
};

export default createCollectionsHandler;
