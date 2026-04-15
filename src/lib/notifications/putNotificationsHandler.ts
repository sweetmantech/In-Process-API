import { NextResponse } from 'next/server';
import { updateNotifications } from '@/lib/supabase/in_process_notifications/updateNotifications';

const putNotificationsHandler = async (artist?: string) => {
  const { data, error } = await updateNotifications({ artist, viewed: true });
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  const count = data?.length ?? 0;
  return NextResponse.json({
    status: 'success',
    updated: count,
    message: `Marked ${count} notifications as viewed`,
  });
};

export default putNotificationsHandler;
