import { z } from 'zod';
import { mainnet, sepolia } from 'viem/chains';

export const NOUNS_CHAIN_IDS = [mainnet.id, sepolia.id] as const;

const nounsChainIdSchema = z.coerce
  .number()
  .refine(
    (id): id is (typeof NOUNS_CHAIN_IDS)[number] =>
      (NOUNS_CHAIN_IDS as readonly number[]).includes(id),
    {
      message: `chainId must be ${mainnet.id} (mainnet) or ${sepolia.id} (sepolia)`,
    }
  )
  .default(mainnet.id);

export default nounsChainIdSchema;
