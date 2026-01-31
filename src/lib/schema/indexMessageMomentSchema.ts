import { z } from 'zod';

export const indexMessageMomentSchema = z.object({
  messageId: z.string(),
});
