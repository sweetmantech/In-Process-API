import { z } from 'zod';
import { isHex } from 'viem';

const walletConnectBodySchema = z.object({
  walletProof: z.object({
    message: z.string().min(1),
    signature: z
      .string()
      .min(1)
      .refine((val) => isHex(val), { message: 'Invalid signature' }),
  }),
});

export default walletConnectBodySchema;
