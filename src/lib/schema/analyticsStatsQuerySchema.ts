import { z } from 'zod';

const analyticsStatsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'all']).optional().default('week'),
  artist: z.string().min(1).optional(),
});

export type AnalyticsStatsQueryParams = z.infer<
  typeof analyticsStatsQuerySchema
>;

export default analyticsStatsQuerySchema;
