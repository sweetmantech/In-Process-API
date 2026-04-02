import { z } from 'zod';
import addressSchema from './addressSchema';
import chainIdSchema from './chainIdSchema';

export const momentSchema = z.object({
  tokenId: z.string(),
  collectionAddress: addressSchema,
  chainId: chainIdSchema,
});
