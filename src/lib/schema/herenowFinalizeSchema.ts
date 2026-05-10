import { z } from 'zod';

const herenowFinalizeSchema = z.object({
  slug: z.string().min(1),
  versionId: z.string().min(1),
  filePath: z.string().optional(),
});

export default herenowFinalizeSchema;
