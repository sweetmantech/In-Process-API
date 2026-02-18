import { z } from 'zod';
import { momentSchema } from './momentSchema';

export const updateSaleSchema = z
  .object({
    moment: momentSchema,
    pricePerToken: z
      .string()
      .regex(/^[0-9]+$/, {
        message: 'pricePerToken must be a non-negative integer string',
      })
      .optional(),
    saleStart: z.string().datetime().optional(),
    saleEnd: z.string().datetime().optional(),
    maxTokensPerAddress: z.number().int().nonnegative().optional(),
    fundsRecipient: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const hasUpdate =
      val.pricePerToken ||
      val.saleStart ||
      val.saleEnd ||
      val.maxTokensPerAddress !== undefined ||
      val.fundsRecipient;
    if (!hasUpdate) {
      ctx.addIssue({
        code: 'custom',
        input: val,
        message: 'At least one sale field must be provided',
      });
    }
  });
