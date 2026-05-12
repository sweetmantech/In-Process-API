import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import arweaveLogsQuerySchema from '@/lib/schema/arweaveLogsQuerySchema';
import { ADMIN_ADDRESSES } from '../consts';

const validateGetArweaveUploadsQuery = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const { artistAddress } = authResult;

  const result = arweaveLogsQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );

  if (!result.success) {
    return NextResponse.json(
      { message: 'Invalid query parameters', errors: result.error.issues },
      { status: 400 }
    );
  }

  const isAdmin = ADMIN_ADDRESSES.includes(artistAddress.toLowerCase());
  const parsed = result.data;

  if (!isAdmin) {
    return {
      ...parsed,
      artist: artistAddress.toLowerCase(),
      listMode: 'detail' as const,
    };
  }

  if (parsed.artist !== undefined) {
    return { ...parsed, listMode: 'detail' as const };
  }

  return { ...parsed, listMode: 'aggregate' as const };
};

export default validateGetArweaveUploadsQuery;
