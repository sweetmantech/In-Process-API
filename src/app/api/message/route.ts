import { NextRequest, NextResponse } from 'next/server';
import { validateMessageIdParam } from '@/lib/messages/validateMessageIdParam';
import getMessageHandler from '@/lib/messages/getMessageHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateMessageIdParam(req);

    if (validated instanceof NextResponse) {
      return validated;
    }
    const { messageId } = validated;

    return getMessageHandler(messageId);
  } catch (error: any) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
