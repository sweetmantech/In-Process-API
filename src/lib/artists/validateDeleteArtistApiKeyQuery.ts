import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { deleteApiKeySchema } from '@/lib/schema/apiKeySchema';

const validateDeleteArtistApiKeyQuery = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const result = deleteApiKeySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0]?.message ?? 'Invalid parameters' },
      { status: 400 }
    );
  }

  return { keyId: result.data.keyId };
};

export default validateDeleteArtistApiKeyQuery;
