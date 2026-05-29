import { NextResponse } from 'next/server';
import { updateNotifications } from '@/lib/supabase/in_process_notifications/updateNotifications';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

const putNotificationsHandler = async (artist_id?: string) => {
  let wallets: string[] | undefined;
  if (artist_id) {
    const { data } = await selectWallets({ artistIds: [artist_id] });
    wallets = (data ?? []).map((w) => w.address);
    if (!wallets.length) {
      return NextResponse.json({
        status: 'success',
        updated: 0,
        message: 'Marked 0 notifications as viewed',
      });
    }
  }

  const { data, error } = await updateNotifications({
    wallets,
    viewed: true,
  });
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
