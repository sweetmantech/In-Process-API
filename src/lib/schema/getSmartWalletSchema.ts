import { z } from 'zod';

export const getSmartWalletSchema = z
  .object({
    accountId: z.string().optional(),
    walletAddress: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.accountId && !data.walletAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either accountId or walletAddress must be provided',
      });
    }
  });
