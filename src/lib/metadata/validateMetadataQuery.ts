import { NextRequest } from 'next/server';
import { metadataBodySchema } from '@/lib/schema/metadataBodySchema';
import { validate } from '@/lib/schema/validate';

const validateMetadataQuery = (req: NextRequest) => {
  const result = validate(
    metadataBodySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  const { uri } = result.data;
  return { uri };
};

export default validateMetadataQuery;
