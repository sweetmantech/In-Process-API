import { z } from 'zod';
import addressSchema from './addressSchema';
import { Transfer_Type } from '@/types/transfer';
import { IS_TESTNET } from '@/lib/consts';
import { base, baseSepolia } from 'viem/chains';

const transfersQuerySchema = z
  .object({
    type: z.enum(Transfer_Type).optional(),
    content_type: z.string().optional(),
    artist: addressSchema.optional(),
    collector: addressSchema.optional(),
    chainId: z.coerce.number().optional(),
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
  })
  .transform((data) => {
    const isProdTransfer = !data.type && !IS_TESTNET;

    if (isProdTransfer || data.chainId) {
      return data;
    }

    return {
      ...data,
      chainId: IS_TESTNET ? baseSepolia.id : base.id,
    };
  });

export type TransfersQueryParams = Omit<
  z.infer<typeof transfersQuerySchema>,
  'type'
>;
export default transfersQuerySchema;
