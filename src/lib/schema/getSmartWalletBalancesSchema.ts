import { z } from 'zod';

export const getSmartWalletBalancesSchema = z.object({
  artistId: z.string(),
  chainId: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number().optional().default(8453)
  ),
});
