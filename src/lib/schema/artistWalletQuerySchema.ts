import { z } from 'zod';

const artistWalletQuerySchema = z.object({
  social_wallet: z.string().min(1, 'missing required param: social_wallet'),
});

export default artistWalletQuerySchema;
