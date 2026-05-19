import { z } from 'zod';
import chainIdSchema from './chainIdSchema';
import addressSchema from './addressSchema';

const collectionQuerySchema = z.object({
  collectionAddress: addressSchema,
  chainId: chainIdSchema,
});

export default collectionQuerySchema;
