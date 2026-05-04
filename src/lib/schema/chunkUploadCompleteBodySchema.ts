import { z } from 'zod';

const chunkUploadCompleteBodySchema = z.object({
  session_id: z.string().uuid(),
});

export default chunkUploadCompleteBodySchema;
