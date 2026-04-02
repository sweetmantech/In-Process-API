import { z } from 'zod';
import { zeroAddress } from 'viem';
import addressSchema from './addressSchema';
import chainIdSchema from './chainIdSchema';

export const distributeSchema = z.object({
  splitAddress: addressSchema,
  tokenAddress: addressSchema
    .optional()
    .transform((val) => (val === undefined ? zeroAddress : val)),
  chainId: chainIdSchema,
});
