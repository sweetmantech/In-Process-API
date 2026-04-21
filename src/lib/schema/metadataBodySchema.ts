import { z } from 'zod';

export const metadataBodySchema = z.object({
  uri: z.string().min(1, 'uri is required'),
});
