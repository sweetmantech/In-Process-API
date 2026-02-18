import { z } from 'zod';

const emailQuerySchema = z.object({
  artist_address: z.string().optional(),
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(1).max(100).optional()),
});

export default emailQuerySchema;
