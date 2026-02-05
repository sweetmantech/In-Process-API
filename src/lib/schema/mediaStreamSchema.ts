import { z } from 'zod';

export const mediaStreamSchema = z.object({
  url: z.string().min(1, 'url is required'),
});
