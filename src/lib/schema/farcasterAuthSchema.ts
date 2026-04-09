import { z } from 'zod';

export const farcasterAuthSchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
});
