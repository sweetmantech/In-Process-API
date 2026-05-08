import { z } from 'zod';
import addressSchema from './addressSchema';
import { momentSchema } from './momentSchema';

export const airdropMomentSchema = z.object({
  recipients: z.array(addressSchema),
  moment: momentSchema,
});
