import selectMessages from '@/lib/supabase/in_process_messages/selectMessages';
import { NextResponse } from 'next/server';
import formatMessages from './formatMessages';

const handleGetMessage = async ({ messageId }: { messageId: string }) => {
  const { data, error } = await selectMessages({
    messageId,
  });

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

  const formattedData = formatMessages(data)?.[0] ?? null;

  return NextResponse.json({
    ...formattedData,
  });
};

export default handleGetMessage;
