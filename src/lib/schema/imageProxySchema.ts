import { z } from 'zod';

export const imageProxySchema = z.object({
  url: z.string().min(1, 'url is required'),
  w: z.coerce.number().int().min(1).max(4096).optional(),
  h: z.coerce.number().int().min(1).max(4096).optional(),
  q: z.coerce.number().int().min(1).max(100).optional().default(80),
  f: z.enum(['webp', 'avif', 'jpeg', 'png']).optional().default('webp'),
});
