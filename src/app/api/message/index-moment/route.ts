import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import selectMessage from '@/lib/supabase/in_process_messages/selectMessage';
import { messageIdSchema } from '@/lib/schema/messageSchema';
import getMomentFromMessage from '@/lib/messages/getMomentFromMessage';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { CHAIN_ID } from '@/lib/consts';
import upsertMessageMoment from '@/lib/supabase/in_process_message_moment/upsertMessageMoment';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = validate(messageIdSchema, body);
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

    const momentData = moment?.[0];
    if (!momentData) throw new Error('Moment not found');

    const { data: messageMoment } = await upsertMessageMoment({
      moment: momentData.id,
      message: messageId,
    });
    if (!messageMoment) throw new Error('Failed to index message');

    return NextResponse.json({
      success: true,
      messageMoment,
    });
  } catch (error: any) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to index message' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
