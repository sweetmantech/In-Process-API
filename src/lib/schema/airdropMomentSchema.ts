import { z } from 'zod';
import airdropRecipientSchema from './airdropRecipientSchema';
import { momentSchema } from './momentSchema';

export const airdropMomentSchema = z.object({
  recipients: z.array(airdropRecipientSchema).min(1),
  moment: momentSchema,
});
