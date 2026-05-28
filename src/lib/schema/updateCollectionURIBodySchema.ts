import { z } from 'zod';

export const updateCollectionURIBodySchema = z.object({
  newUri: z.string().min(1, 'URI is required'),
  newCollectionName: z.string().min(1, 'Collection name is required'),
});
