import { z } from 'zod';
import chunkUploadMaxPartBytes, {
  chunkUploadMaxChunkCount,
  chunkUploadMaxTotalBytes,
} from '@/lib/chunk-upload/chunkUploadMaxPartBytes';

const chunkUploadSessionBodySchema = z
  .object({
    filename: z.string().min(1).max(512),
    content_type: z
      .string()
      .min(1)
      .max(200)
      .default('application/octet-stream'),
    total_chunks: z.number().int().min(1).max(chunkUploadMaxChunkCount),
    total_size_bytes: z.number().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.total_size_bytes !== undefined) {
      if (data.total_size_bytes > chunkUploadMaxTotalBytes) {
        ctx.addIssue({
          code: 'custom',
          message: `total_size_bytes must be at most ${chunkUploadMaxTotalBytes}`,
          path: ['total_size_bytes'],
        });
      }
      const maxBytes = data.total_chunks * chunkUploadMaxPartBytes;
      if (data.total_size_bytes > maxBytes) {
        ctx.addIssue({
          code: 'custom',
          message: `total_size_bytes must be at most total_chunks * ${chunkUploadMaxPartBytes}`,
          path: ['total_size_bytes'],
        });
      }
    }
  });

export default chunkUploadSessionBodySchema;
