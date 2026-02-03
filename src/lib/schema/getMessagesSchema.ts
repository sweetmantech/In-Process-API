import { z } from 'zod';

export const getMessagesSchema = z.object({
  messageId: z.string().uuid().optional(),
  moment: z.string().default('false'),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
});
