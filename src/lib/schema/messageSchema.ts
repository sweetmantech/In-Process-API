import { z } from 'zod';

export const messageIdSchema = z.object({
  messageId: z.string().uuid(),
});
