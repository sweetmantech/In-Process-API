import { z } from 'zod';

export const getNotificationsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .transform((v) => Math.min(v, 100))
    .optional()
    .default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
  artist_id: z.string().uuid().optional(),
  viewed: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const putNotificationsQuerySchema = z.object({
  artist_id: z.string().uuid().optional(),
});
