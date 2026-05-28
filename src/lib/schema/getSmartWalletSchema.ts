import { z } from 'zod';

export const getSmartWalletSchema = z.object({
  artistId: z.string(),
});
