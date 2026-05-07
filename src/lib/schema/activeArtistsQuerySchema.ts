import { z } from 'zod';

const activeArtistsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
  period: z.enum(['day', 'week', 'month', 'all']).optional().default('all'),
  artist: z.string().min(1).optional(),
});

export default activeArtistsQuerySchema;
