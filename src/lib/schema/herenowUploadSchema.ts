import { z } from 'zod';

const herenowUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  contentType: z.string().min(1),
  hash: z.string().min(1),
});

export default herenowUploadSchema;
