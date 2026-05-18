import { z } from 'zod';
import { momentSchema } from './momentSchema';
import addressSchema from './addressSchema';
import isZora1155Impl from '@/lib/viem/isZora1155Impl';

export const updateMomentURISchema = z
  .object({
    moment: momentSchema,
    newUri: z.string(),
    newCollectionAddress: addressSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.newCollectionAddress &&
      data.newCollectionAddress === data.moment.collectionAddress
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['newCollectionAddress'],
        message:
          'newCollectionAddress must differ from the moment collection address',
      });
    }
  })
  .superRefine(async (data, ctx) => {
    if (!data.newCollectionAddress) return;
    const valid = await isZora1155Impl(
      data.newCollectionAddress,
      data.moment.chainId
    );
    if (!valid) {
      ctx.addIssue({
        code: 'custom',
        path: ['newCollectionAddress'],
        message: 'newCollectionAddress is not a valid Zora 1155 contract',
      });
    }
  });
