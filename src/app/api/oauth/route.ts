import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof NextResponse) return authResult;
    return NextResponse.json({ artistAddress: authResult.artistAddress });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
