import { z } from 'zod';
import { momentSchema } from './momentSchema';

export const commentsSchema = z.object({
  moment: momentSchema,
  offset: z.number(),
  replyToId: z.string().min(1).optional(),
});
