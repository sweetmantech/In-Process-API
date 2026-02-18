import { z } from 'zod';
import { momentSchema } from './momentSchema';

export const updateSaleSchema = z
  .object({
    moment: momentSchema,
    pricePerToken: z.string().optional(),
    saleStart: z.string().datetime().optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.pricePerToken && !val.saleStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of pricePerToken or saleStart must be provided',
      });
    }
  });
