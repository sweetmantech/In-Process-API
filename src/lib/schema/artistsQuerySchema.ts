import { z } from 'zod';

const artistsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(1).max(100).optional()),
  page: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(1).optional()),
  type: z.enum(['human', 'bot']).optional().default('human'),
});

export default artistsQuerySchema;
