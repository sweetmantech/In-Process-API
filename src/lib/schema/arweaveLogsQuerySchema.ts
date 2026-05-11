import { z } from 'zod';
const arweaveLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
  period: z.enum(['day', 'week', 'month', 'all']).optional(),
  artist: z.string().min(1).optional(),
  sort_by: z
    .enum(['size', 'usdc_cost', 'created_at'])
    .optional()
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export default arweaveLogsQuerySchema;
