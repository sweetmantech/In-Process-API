import { z } from 'zod';
import addressSchema from './addressSchema';
import chainIdSchema from './chainIdSchema';

export const updateCollectionURISchema = z.object({
  collection: z.object({
    address: addressSchema,
    chainId: chainIdSchema,
  }),
  newUri: z.string().min(1, 'URI is required'),
  newCollectionName: z.string().min(1, 'Collection name is required'),
});
