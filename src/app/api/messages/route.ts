import { NextRequest, NextResponse } from 'next/server';
import { validateMessagesParam } from '@/lib/messages/validateMessagesParam';
import getMessagesHandler from '@/lib/messages/getMessagesHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateMessagesParam(req);

    if (validated instanceof NextResponse) {
      return validated;
    }
    const { messageId, page, limit, artistAddress, moment } = validated;

    return getMessagesHandler({
      artistAddress,
      moment,
      messageId,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
