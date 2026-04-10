import { NextResponse } from 'next/server';
import selectMessage from '@/lib/supabase/in_process_messages/selectMessages';
import getMomentFromMessage from '@/lib/messages/getMomentFromMessage';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { CHAIN_ID } from '@/lib/consts';
import upsertMessageMoment from '@/lib/supabase/in_process_message_moment/upsertMessageMoment';
import formatMessages from './formatMessages';

const indexMomentHandler = async (messageId: string) => {
  const { data } = await selectMessage({ messageId });
  if (!data?.length) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  const messages = formatMessages(data);
  const message = messages[0];
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  const momentInfo = getMomentFromMessage(message);
  if (!momentInfo) {
    return NextResponse.json(
      { error: 'Message is not a moment message' },
      { status: 400 }
    );
  }
  const { collectionAddress, tokenId } = momentInfo;

  const { data: moment } = await selectMoments({
    moment: {
      collectionAddress,
      tokenId,
      chainId: CHAIN_ID,
    },
  });

  const momentData = moment?.[0];
  if (!momentData) {
    return NextResponse.json({ error: 'Moment not found' }, { status: 404 });
  }

  const { data: messageMoment } = await upsertMessageMoment({
    moment: momentData.id,
    message: messageId,
  });
  if (!messageMoment) {
    return NextResponse.json(
      { error: 'Failed to index message' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    messageMoment,
  });
};

export default indexMomentHandler;
