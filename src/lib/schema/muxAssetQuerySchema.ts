import { z } from 'zod';

const muxAssetQuerySchema = z.object({
  uploadId: z.string(),
});

export default muxAssetQuerySchema;
