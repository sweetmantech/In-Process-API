import { z } from 'zod';

const collectorsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
  period: z.enum(['day', 'week', 'month', 'all']).optional().default('all'),
  artist: z.string().min(1).optional(),
  sort_by: z
    .enum(['collected_count', 'eth_spent', 'usdc_spent'])
    .optional()
    .default('collected_count'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export default collectorsQuerySchema;
