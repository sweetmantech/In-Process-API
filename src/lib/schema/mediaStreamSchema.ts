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
  /**
   * When `1` or `true`, stream through this API instead of 307 to the origin.
   */
  proxy: z
    .string()
    .optional()
    .transform((v) => v === '1' || v?.toLowerCase() === 'true'),
});
