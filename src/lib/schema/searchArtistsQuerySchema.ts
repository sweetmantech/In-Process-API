import { z } from 'zod';

const searchArtistsQuerySchema = z.object({
  query: z.string().trim().min(1, 'Missing param: query'),
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(1).max(50).optional())
    .transform((v) => v ?? 10),
});

export default searchArtistsQuerySchema;
