import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';

const paymentsQuerySchema = z
  .object({
    limit: z.preprocess(
      (v) => (v === undefined ? 20 : Math.min(Number(v), 100)),
      z.number().int().min(1).max(100)
    ),
    page: z.preprocess(
      (v) => (v === undefined ? 1 : Number(v)),
      z.number().int().min(1)
    ),
    artist: addressSchema.optional(),
    collector: addressSchema.optional(),
    chainId: z.preprocess(
      (v) => (v === undefined ? undefined : Number(v)),
      z.number().int().nonnegative().optional()
    ),
    audioOnly: z.preprocess((v) => {
      if (v === undefined || v === 'false' || v === '0') return false;
      if (v === 'true' || v === '1') return true;
      return v;
    }, z.boolean()),
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
