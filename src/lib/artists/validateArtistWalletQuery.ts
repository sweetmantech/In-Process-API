import { NextRequest, NextResponse } from 'next/server';
import artistWalletQuerySchema from '@/lib/schema/artistWalletQuerySchema';

const validateArtistWalletQuery = (req: NextRequest) => {
  const parsed = artistWalletQuerySchema.safeParse(
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

export default validateArtistWalletQuery;
