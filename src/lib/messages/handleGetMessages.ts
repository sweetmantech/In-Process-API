import selectMessageMetadatas from '@/lib/supabase/in_process_message_metadata/selectMessageMetadatas';
import { NextResponse } from 'next/server';
import formatMessages from './formatMessages';
import { ADMIN_ADDRESSES } from '../consts';

const handleGetMessages = async ({
  artistAddress,
  moment,
  page,
  limit,
}: {
  artistAddress: string;
  moment: boolean;
  page: number;
  limit: number;
}) => {
  const { data, error, count } = await selectMessageMetadatas({
    artistAddress: ADMIN_ADDRESSES.includes(artistAddress.toLowerCase())
      ? undefined
      : artistAddress,
    moment,
    page,
    limit,
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

  return NextResponse.json({
    messages: formatMessages(data),
    count,
  });
};

export default handleGetMessages;
