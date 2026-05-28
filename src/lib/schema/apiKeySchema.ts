import { z } from 'zod';

export const createApiKeySchema = z.object({
  key_name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
});

export const deleteApiKeySchema = z.object({
  keyId: z.uuid({ error: 'keyId must be a valid UUID' }),
});
