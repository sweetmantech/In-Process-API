import { z } from 'zod';

export const logArweaveUploadItemSchema = z.object({
  arweave_uri: z.string().regex(/^ar:\/\/.+/, 'Must be a valid ar:// URI'),
  winc_cost: z.string(),
  file_size_bytes: z.number().int().positive(),
  content_type: z.string().min(1),
});

const logArweaveUploadSchema = z.array(logArweaveUploadItemSchema).min(1);

export default logArweaveUploadSchema;
