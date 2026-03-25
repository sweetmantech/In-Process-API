import { z } from 'zod';
import { CHAIN_ID } from '@/lib/consts';

const timelineQuerySchema = z
  .object({
    limit: z
      .string()
      .optional()
      .transform((v) => Math.min(Number(v) || 100, 100)),
    page: z
      .string()
      .optional()
      .transform((v) => Number(v) || 1),
    collection: z.string().optional(),
    artist: z.string().optional(),
    chain_id: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : CHAIN_ID)),
    hidden: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    audioOnly: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    content_type: z.string().optional(),
    period: z.string().optional(),
    channel: z.string().optional(),
    type: z.enum(['mutual', 'default']).optional(),
  })
  .transform(({ chain_id, audioOnly, content_type, ...rest }) => ({
    ...rest,
    chainId: chain_id,
    mime: audioOnly
      ? 'audio/%'
      : content_type
        ? `${content_type}/%`
        : undefined,
  }));

export default timelineQuerySchema;
