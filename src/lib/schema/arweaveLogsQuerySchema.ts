import { z } from 'zod';

const arweaveLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
  period: z.enum(['day', 'week', 'month', 'all']).optional(),
  aggregation: z
    .enum(['true', 'false'])
    .optional()
    .default('true')
    .transform((v) => v === 'true'),
  artist: z.string().min(1).optional(),
  sort_by: z
    .enum(['usdc_cost', 'winc_cost', 'size', 'created_at'])
    .optional()
    .default('usdc_cost'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ArweaveLogsQueryInput = z.infer<typeof arweaveLogsQuerySchema>;

export default arweaveLogsQuerySchema;
