import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';

const emailsQuerySchema = z.object({
  callerAddress: addressSchema,
  artistAddress: addressSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(1000).optional(),
});

export default emailsQuerySchema;
