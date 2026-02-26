import { z } from 'zod';

export const loginWithCodeSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
});
