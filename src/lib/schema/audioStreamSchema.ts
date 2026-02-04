import { z } from 'zod';

export const audioStreamSchema = z.object({
  url: z.string().min(1, 'url is required'),
});
