import { NextResponse } from 'next/server';
import selectMessage from '../supabase/in_process_messages/selectMessage';

const getMessageHandler = async (messageId: string) => {
  const { data, error } = await selectMessage(messageId);

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  const momentData = data.moment?.[0]?.in_process_moments ?? null;

  return NextResponse.json({
    ...data,
    moment: momentData,
  });
};

export default getMessageHandler;
