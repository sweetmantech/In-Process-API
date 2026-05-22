import { z } from 'zod';
import addressSchema from './addressSchema';
import chainIdSchema from './chainIdSchema';
import { splitSchema } from './createMomentSchema';
import { validateSplitAddress } from '@/lib/splits/validateSplitAddress';
import { calculateTotalPercentage } from '@/lib/splits/calculateTotalPercentage';

const collectionItemSchema = z
  .object({
    uri: z.string().min(1, 'URI is required'),
    name: z.string().min(1, 'Collection name is required'),
    splits: z.array(splitSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.splits || data.splits.length === 0) return;
    if (data.splits.length < 2) {
      ctx.addIssue({
        code: 'custom',
        input: data,
        message: 'Splits must have at least 2 recipients',
        path: ['splits'],
      });
      return;
    }
    for (let i = 0; i < data.splits.length; i++) {
      const addressError = validateSplitAddress(data.splits[i].address);
      if (addressError) {
        ctx.addIssue({
          code: 'custom',
          input: data,
          message: `Split ${i + 1}: ${addressError}`,
          path: ['splits', i, 'address'],
        });
        return;
      }
    }
    if (calculateTotalPercentage(data.splits) !== 100) {
      ctx.addIssue({
        code: 'custom',
        input: data,
        message: 'Splits total percentage must equal 100%',
        path: ['splits'],
      });
    }
  });

export type CollectionItem = z.infer<typeof collectionItemSchema>;

export const createCollectionSchema = z.object({
  account: addressSchema,
  collection: collectionItemSchema,
  chainId: chainIdSchema,
});
