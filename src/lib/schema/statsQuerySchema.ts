import { z } from 'zod';
import addressSchema from './addressSchema';

const statsQuerySchema = z.object({
  artist: addressSchema,
});

export type StatsQueryParams = z.infer<typeof statsQuerySchema>;
export default statsQuerySchema;
