import { z } from 'zod';

/** On-chain video asset URIs only (no data:/blob:). */
export const mediaStreamSchema = z.object({
  url: z
    .string()
    .min(1, 'url is required')
    .refine(
      (url) => /^(https|ipfs|ar):/.test(url),
      'Invalid or unsupported URL format'
    ),
});
