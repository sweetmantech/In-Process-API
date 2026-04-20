import { NextRequest } from 'next/server';
import { metadataBodySchema } from '@/lib/schema/metadataBodySchema';
import { validate } from '@/lib/schema/validate';

const validateMetadataQuery = (req: NextRequest) => {
  const result = validate(
    metadataBodySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  const { uri, content_uri } = result.data;
  return { uri, contentUri: content_uri };
};

export default validateMetadataQuery;
