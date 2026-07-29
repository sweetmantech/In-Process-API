import { NextRequest, NextResponse } from 'next/server';
import validateCreateCommentCAIP from '@/lib/comments/validateCreateCommentCAIP';
import createCommentHandler from '@/lib/comments/createCommentHandler';
import parseCreateCommentError from '@/lib/comments/parseCreateCommentError';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ network: string; contract: string }> }
) {
  try {
    const validated = await validateCreateCommentCAIP(req, await params);
    if (validated instanceof NextResponse) return validated;
    return await createCommentHandler(validated);
  } catch (e: any) {
    const { message, status } = parseCreateCommentError(e);
    return NextResponse.json({ message }, { status });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
