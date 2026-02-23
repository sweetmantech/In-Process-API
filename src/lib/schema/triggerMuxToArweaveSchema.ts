import { z } from 'zod';
import { CHAIN_ID } from '../consts';

export const triggerMuxToArweaveSchema = z.object({
  collectionAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid collection address format'),
  tokenId: z.string(),
  chainId: z.number().optional().default(CHAIN_ID),
});
