import { NextRequest, NextResponse } from 'next/server';
import muxAssetQuerySchema from '@/lib/schema/muxAssetQuerySchema';

const validateMuxAssetQuery = (req: NextRequest) => {
  const result = muxAssetQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) {
    return NextResponse.json(
      { message: 'uploadId is required' },
      { status: 400 }
    );
  }
  return result.data;
};

export default validateMuxAssetQuery;
