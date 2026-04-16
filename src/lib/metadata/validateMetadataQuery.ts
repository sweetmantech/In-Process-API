import { NextRequest, NextResponse } from 'next/server';
import { metadataBodySchema } from '@/lib/schema/metadataBodySchema';
import { validate } from '@/lib/schema/validate';

const validateMetadataQuery = async (req: NextRequest) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        message: 'Invalid input',
        errors: [{ field: '', message: 'Malformed JSON body' }],
      },
      { status: 400 }
    );
  }

  const result = validate(metadataBodySchema, body);
  if (!result.success) return result.response as NextResponse;

  const { uri, content_uri } = result.data;
  return { uri, contentUri: content_uri };
};

export default validateMetadataQuery;
