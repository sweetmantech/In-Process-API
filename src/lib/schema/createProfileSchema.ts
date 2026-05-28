import { z } from 'zod';

const createProfileSchema = z.object({
  username: z.string().optional(),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  x: z.string().optional(),
  telegram: z.string().optional(),
});

export default createProfileSchema;
