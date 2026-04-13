import { z } from 'zod';
import addressSchema from './addressSchema';
import chainIdSchema from './chainIdSchema';
import { Transfer_Type } from '@/types/transfer';

const transfersQuerySchema = z.object({
  type: z.enum(Transfer_Type).optional(),
  spender: addressSchema.optional(),
  recipient: addressSchema.optional(),
  chainId: chainIdSchema,
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export default transfersQuerySchema;
