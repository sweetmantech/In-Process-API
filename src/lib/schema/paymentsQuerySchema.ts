import { z } from 'zod';

const paymentsQuerySchema = z
  .object({
    limit: z
      .string()
      .optional()
      .transform((v) => Math.min(Number(v) || 20, 100)),
    page: z
      .string()
      .optional()
      .transform((v) => Number(v) || 1),
    artist: z.string().optional(),
    collector: z.string().optional(),
    chainId: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined)),
    audioOnly: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    content_type: z.string().optional(),
  })
  .transform(({ audioOnly, content_type, ...rest }) => ({
    ...rest,
    mime: audioOnly
      ? 'audio/%'
      : content_type
        ? `${content_type}/%`
        : undefined,
  }));

export default paymentsQuerySchema;
