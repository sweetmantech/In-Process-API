import { z } from 'zod';
import {
  CHUNK_UPLOAD_MAX_PART_BYTES,
  CHUNK_UPLOAD_MAX_CHUNK_COUNT,
  CHUNK_UPLOAD_MAX_TOTAL_BYTES,
} from '@/lib/consts';

const chunkUploadSessionBodySchema = z
  .object({
    filename: z.string().min(1).max(512),
    content_type: z
      .string()
      .min(1)
      .max(200)
      .default('application/octet-stream'),
    total_chunks: z.number().int().min(1).max(CHUNK_UPLOAD_MAX_CHUNK_COUNT),
    total_size_bytes: z.number().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.total_size_bytes !== undefined) {
      if (data.total_size_bytes > CHUNK_UPLOAD_MAX_TOTAL_BYTES) {
        ctx.addIssue({
          code: 'custom',
          message: `total_size_bytes must be at most ${CHUNK_UPLOAD_MAX_TOTAL_BYTES}`,
          path: ['total_size_bytes'],
        });
      }
      const maxBytes = data.total_chunks * CHUNK_UPLOAD_MAX_PART_BYTES;
      if (data.total_size_bytes > maxBytes) {
        ctx.addIssue({
          code: 'custom',
          message: `total_size_bytes must be at most total_chunks * ${CHUNK_UPLOAD_MAX_PART_BYTES}`,
          path: ['total_size_bytes'],
        });
      }
    }
  });

export default chunkUploadSessionBodySchema;
