import { z } from 'zod';
import addressSchema from './addressSchema';
import { Transfer_Type } from '@/types/transfer';
import { IS_TESTNET } from '@/lib/consts';
import { base, baseSepolia } from 'viem/chains';
import chainIdSchema from './chainIdSchema';

const transfersQuerySchema = z
  .object({
    type: z.enum(Transfer_Type).optional(),
    content_type: z.string().optional(),
    artist: addressSchema.optional(),
    collector: addressSchema.optional(),
    collection: addressSchema.optional(),
    tokenId: z.coerce.number().int().min(0).optional(),
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
    const hasCollection = data.collection !== undefined;
    const hasTokenId = data.tokenId !== undefined;
    if (hasCollection !== hasTokenId) {
      ctx.addIssue({
        code: 'custom',
        message: 'collection and tokenId must both be set or both be omitted',
        path: [hasCollection ? 'tokenId' : 'collection'],
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
> & { momentId?: string };
export default transfersQuerySchema;
