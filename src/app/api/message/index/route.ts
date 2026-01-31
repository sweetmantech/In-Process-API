import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import selectMessage from '@/lib/supabase/in_process_messages/selectMessage';
import { messageIdSchema } from '@/lib/schema/messageSchema';
import getMomentFromMessage from '@/lib/messages/getMomentFromMessage';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { CHAIN_ID } from '@/lib/consts';
import upsertMessageMoment from '@/lib/supabase/in_process_message_moment/upsertMessageMoment';

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

    const { data: message } = await selectMessage(messageId);
    if (!message) throw new Error('Message not found');

    const momentInfo = getMomentFromMessage(message);
    if (!momentInfo) throw new Error('Message is not a moment message');
    const { collectionAddress, tokenId } = momentInfo;

    const { data: moment } = await selectMoments({
      moment: {
        collectionAddress,
        tokenId,
        chainId: CHAIN_ID,
      },
    });
    if (!moment) throw new Error('Moment not found');

    const momentData = moment?.[0] ?? null;
    if (momentData) {
      const { data: messageMoment } = await upsertMessageMoment({
        moment: momentData.id,
        message: messageId,
      });
      if (messageMoment) {
        return NextResponse.json({
          success: true,
          messageMoment,
        });
      }
    }
    return NextResponse.json(
      { success: false, error: 'Failed to index message' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
