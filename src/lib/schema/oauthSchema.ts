import { z } from 'zod';

export const oauthSchema = z.object({
  email: z.string().email(),
});
