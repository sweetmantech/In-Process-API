import { z } from 'zod';
import addressSchema from './addressSchema';
import { contractSchema, splitSchema, tokenSchema } from './createMomentSchema';
import { validateSplitAddress } from '@/lib/splits/validateSplitAddress';
import { calculateTotalPercentage } from '@/lib/splits/calculateTotalPercentage';
import nounsChainIdSchema from './nounsChainIdSchema';

export const createNounsProposalSchema = z
  .object({
    chainId: nounsChainIdSchema,
    account: addressSchema,
    contract: contractSchema,
    tokens: z.array(tokenSchema).min(1, 'At least one token is required'),
    splits: z.array(splitSchema).optional(),
    proposal: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.splits || data.splits.length === 0) {
      return;
    }

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

export type CreateNounsProposalInput = z.infer<
  typeof createNounsProposalSchema
>;
