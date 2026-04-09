import { NextRequest, NextResponse } from 'next/server';

const validateMetadataQuery = (
  req: NextRequest
): { uri: string } | NextResponse => {
  const uri = req.nextUrl.searchParams.get('uri');
  if (!uri) {
    return NextResponse.json({ message: 'No URI provided' }, { status: 400 });
  }
  return { uri };
};

export default validateMetadataQuery;
