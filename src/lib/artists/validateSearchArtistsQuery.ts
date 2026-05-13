import { NextRequest, NextResponse } from 'next/server';
import searchArtistsQuerySchema from '@/lib/schema/searchArtistsQuerySchema';

const validateSearchArtistsQuery = (req: NextRequest) => {
  const parsed = searchArtistsQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid query params' },
      { status: 400 }
    );
  }
  return parsed.data;
};

export default validateSearchArtistsQuery;
