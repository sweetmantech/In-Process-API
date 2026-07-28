import { NextRequest, NextResponse } from 'next/server';
import validateCreateCommentCAIP from '@/lib/comments/validateCreateCommentCAIP';
import createCommentHandler from '@/lib/comments/createCommentHandler';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ network: string; contract: string }> }
) {
  try {
    const validated = await validateCreateCommentCAIP(req, await params);
    if (validated instanceof NextResponse) return validated;
    return createCommentHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
