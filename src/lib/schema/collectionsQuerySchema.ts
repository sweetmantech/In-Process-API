import { z } from 'zod';
import chainIdSchema from './chainIdSchema';
import addressSchema from './addressSchema';

const collectionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100),
  page: z.coerce.number().int().min(1).default(1),
  artist: addressSchema.optional(),
  chain_id: chainIdSchema,
});

export default collectionsQuerySchema;
