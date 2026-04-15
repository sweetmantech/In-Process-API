import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';

export const getNotificationsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .transform((v) => Math.min(v, 100))
    .optional()
    .default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
  artist: addressSchema.optional(),
  viewed: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const putNotificationsQuerySchema = z.object({
  artist: addressSchema.optional(),
});
