import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';

const validateOAuthGet = async (
  req: NextRequest
): Promise<NextResponse | { artistAddress: string }> => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse)
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  return { artistAddress: authResult.artistAddress };
};

export default validateOAuthGet;
