import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';

const bytes32Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid bytes32');

export const commentIdentifierSchema = z.object({
  commenter: addressSchema,
  contractAddress: addressSchema,
  tokenId: z.union([z.string(), z.number()]).transform(String),
  nonce: bytes32Schema,
});

export const createCommentBodySchema = z.object({
  tokenId: z.union([z.string(), z.number()]).transform(String),
  text: z.string().min(1, 'text is required'),
  replyTo: commentIdentifierSchema.optional(),
  referrer: addressSchema.optional(),
});
