import { z } from 'zod';
import { splitSchema } from './createMomentSchema';
import { validateSplitAddress } from '@/lib/splits/validateSplitAddress';
import { calculateTotalPercentage } from '@/lib/splits/calculateTotalPercentage';

export const createSplitsSchema = z
  .object({
    splits: z.array(splitSchema),
  })
  .superRefine((data, ctx) => {
    if (!data.splits || data.splits.length < 2) {
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
