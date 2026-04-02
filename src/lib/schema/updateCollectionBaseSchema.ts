import { z } from 'zod';
import addressSchema from './addressSchema';
import chainIdSchema from './chainIdSchema';

export const updateCollectionBaseSchema = z.object({
  collection: z.object({
    address: addressSchema,
    chainId: chainIdSchema,
  }),
  newUri: z.string().min(1, 'URI is required'),
});
