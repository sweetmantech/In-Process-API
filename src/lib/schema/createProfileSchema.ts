import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';

const createProfileSchema = z.object({
  address: addressSchema,
  username: z.string().optional(),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  x: z.string().optional(),
  telegram: z.string().optional(),
});

export default createProfileSchema;
