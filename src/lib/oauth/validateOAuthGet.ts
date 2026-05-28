import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';

const validateOAuthGet = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse)
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  return authResult;
};

export default validateOAuthGet;
