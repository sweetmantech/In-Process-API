import { z } from 'zod';
import addressSchema from './addressSchema';
import chainIdSchema from './chainIdSchema';
import { Transfer_Type } from '@/types/transfer';

const transfersQuerySchema = z
  .object({
    type: z.enum(Transfer_Type).optional(),
    content_type: z.string().optional(),
    artist: addressSchema.optional(),
    collector: addressSchema.optional(),
    chainId: chainIdSchema,
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    page: z.coerce.number().int().min(1).optional().default(1),
  })
  .superRefine((data, ctx) => {
    if (data.artist !== undefined && data.collector !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'artist and collector cannot both be set',
        path: ['artist'],
      });
    }
  });

export type TransfersQueryParams = Omit<
  z.infer<typeof transfersQuerySchema>,
  'type'
>;

export default transfersQuerySchema;
