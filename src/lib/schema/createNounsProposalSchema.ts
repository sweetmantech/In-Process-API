import { z } from 'zod';
import { mainnet, sepolia } from 'viem/chains';
import addressSchema from './addressSchema';

const NOUNS_CHAIN_IDS = [mainnet.id, sepolia.id] as const;

const nounsChainIdSchema = z.coerce
  .number()
  .refine((id): id is (typeof NOUNS_CHAIN_IDS)[number] =>
    (NOUNS_CHAIN_IDS as readonly number[]).includes(id), {
    message: `chainId must be ${mainnet.id} (mainnet) or ${sepolia.id} (sepolia)`,
  })
  .default(mainnet.id);

export const createNounsProposalSchema = z.object({
  chainId: nounsChainIdSchema,
  account: addressSchema,
  collection: z.object({
    name: z.string().min(1),
    uri: z.string().min(1),
  }),
  token: z.object({
    uri: z.string().min(1),
    maxSupply: z.number().int().nonnegative().default(0),
  }),
  proposal: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

export type CreateNounsProposalInput = z.infer<typeof createNounsProposalSchema>;
