import { z } from 'zod';

const arweaveLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export default arweaveLogsQuerySchema;
