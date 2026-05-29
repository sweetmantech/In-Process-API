import { NextResponse } from 'next/server';
import { selectNotifications } from '@/lib/supabase/in_process_notifications/selectNotifications';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

const getNotificationsHandler = async (params: {
  limit: number;
  page: number;
  artist_id?: string;
  viewed?: boolean;
}) => {
  let wallets: string[] | undefined;
  if (params.artist_id) {
    const { data } = await selectWallets({ artistIds: [params.artist_id] });
    wallets = (data ?? []).map((w) => w.address);
    if (!wallets.length) {
      return NextResponse.json({
        status: 'success',
        notifications: [],
        pagination: {
          page: params.page,
          limit: params.limit,
          total_count: 0,
          total_pages: 0,
        },
      });
    }
  }

  const { data, count, error } = await selectNotifications({
    ...params,
    wallets,
  });
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  const total = count ?? 0;
  const notifications = (data ?? []).map((n) => ({
    ...n,
    artist: (n as any).wallet_owner?.artist ?? null,
    transfer: {
      ...n.transfer,
      collector: { username: n.transfer.collector?.artist?.username ?? null },
    },
  }));
  return NextResponse.json({
    status: 'success',
    notifications,
    pagination: {
      page: params.page,
      limit: params.limit,
      total_count: total,
      total_pages: Math.ceil(total / params.limit),
    },
  });
};

export default getNotificationsHandler;
