import { NextResponse } from 'next/server';
import { selectNotifications } from '@/lib/supabase/in_process_notifications/selectNotifications';

const getNotificationsHandler = async (params: {
  limit: number;
  page: number;
  artist?: string;
  viewed?: boolean;
}) => {
  const { data, error } = await selectNotifications(params);
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ status: 'success', notifications: data ?? [] });
};

export default getNotificationsHandler;
