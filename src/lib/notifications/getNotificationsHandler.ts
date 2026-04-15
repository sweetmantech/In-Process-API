import { NextResponse } from 'next/server';
import { selectNotifications } from '@/lib/supabase/in_process_notifications/selectNotifications';

const getNotificationsHandler = async (params: {
  limit: number;
  page: number;
  artist?: string;
  viewed?: boolean;
}) => {
  const { data, count, error } = await selectNotifications(params);
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  const total = count ?? 0;
  return NextResponse.json({
    status: 'success',
    notifications: data ?? [],
    pagination: {
      page: params.page,
      limit: params.limit,
      total_count: total,
      total_pages: Math.ceil(total / params.limit),
    },
  });
};

export default getNotificationsHandler;
