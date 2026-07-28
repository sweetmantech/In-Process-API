import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';

const bytes32Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid bytes32');

const tokenIdSchema = z
  .union([
    z.number().int().nonnegative(),
    z.string().regex(/^\d+$/, 'tokenId must be a numeric decimal string'),
  ])
  .transform(String);

export const commentIdentifierSchema = z.object({
  commenter: addressSchema,
  contractAddress: addressSchema,
  tokenId: tokenIdSchema,
  nonce: bytes32Schema,
});

export const createCommentBodySchema = z.object({
  tokenId: tokenIdSchema,
  text: z.string().min(1, 'text is required'),
  replyTo: commentIdentifierSchema.optional(),
  referrer: addressSchema.optional(),
});
