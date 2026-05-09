import { NextRequest } from 'next/server';
import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';
import chainIdSchema from '@/lib/schema/chainIdSchema';
import { validate } from '@/lib/schema/validate';

export const ogArtistQuerySchema = z.object({
  artistAddress: addressSchema,
  chainId: chainIdSchema,
});

const validateOgArtistQuery = (req: NextRequest) => {
  const result = validate(
    ogArtistQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;
  return result.data;
};

export default validateOgArtistQuery;
