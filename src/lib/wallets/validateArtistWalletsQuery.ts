import { NextRequest, NextResponse } from 'next/server';
import artistWalletsQuerySchema from '@/lib/schema/artistWalletsQuerySchema';

const validateArtistWalletsQuery = (req: NextRequest) => {
  const result = artistWalletsQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) {
    return NextResponse.json(
      { message: 'Invalid or missing artistId query parameter' },
      { status: 400 }
    );
  }

  return result.data;
};

export default validateArtistWalletsQuery;
