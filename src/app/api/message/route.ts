import { NextRequest, NextResponse } from 'next/server';
import { messageIdSchema } from '@/lib/schema/messageSchema';
import { validate } from '@/lib/schema/validate';
import selectMessage from '@/lib/supabase/in_process_messages/selectMessage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      messageId: searchParams.get('messageId'),
    };

    const validationResult = validate(messageIdSchema, queryParams);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { messageId } = validationResult.data;

    const { data, error } = await selectMessage(messageId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching message:', error);
      return NextResponse.json(
        { error: 'Failed to fetch message' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
