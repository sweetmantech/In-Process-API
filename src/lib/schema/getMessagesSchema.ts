import { z } from 'zod';

export const getMessagesSchema = z.object({
  messageId: z.optional(z.string().uuid()),
  moment: z.optional(z.string().default('false')),
  page: z.optional(z.string().transform(Number).default(1)),
  limit: z.optional(z.string().transform(Number).default(10)),
});
