import { NextRequest, NextResponse } from 'next/server';
import { validateMessageIdBody } from '@/lib/messages/validateMessageIdBody';
import indexMomentHandler from '@/lib/messages/indexMomentHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateMessageIdBody(req);

    if (validated instanceof NextResponse) {
      return validated;
    }
    const { messageId } = validated;

    return indexMomentHandler(messageId);
  } catch (error: any) {
    console.error('Error indexing moment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to index moment' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
