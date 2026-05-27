import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import type { Address } from 'viem';

const handleNotify = async (
  thread: Thread<TelegramThreadState>,
  artistAddress: Address
) => {
  const data = await selectAccountNotification(artistAddress);

  const enabled = !(data?.notify_enabled ?? false);
  await upsertAccountNotification({
    artist_address: artistAddress,
    notify_enabled: enabled,
  });

  const text = enabled
    ? "🔔 Airdrop notifications are now ON. I'll let you know any time someone sends your wallet an airdrop."
    : '🔕 Airdrop notifications are now OFF. You can turn them back on anytime with /notify.';
  await thread.post(text);
};

export default handleNotify;
