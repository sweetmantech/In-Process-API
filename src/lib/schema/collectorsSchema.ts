import { z } from 'zod';
import { momentSchema } from './momentSchema';

export const collectorsSchema = z.object({
  moment: momentSchema,
  offset: z.number(),
});
