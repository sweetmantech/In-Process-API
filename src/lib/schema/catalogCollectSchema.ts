import { z } from 'zod';
import addressSchema from './addressSchema';
import { momentSchema } from './momentSchema';

export const catalogCollectSchema = z.object({
  moment: momentSchema,
  amount: z.number().int().min(1).default(1),
  recipient: addressSchema.optional(),
  ref0: addressSchema.optional(),
  ref1: addressSchema.optional(),
});
