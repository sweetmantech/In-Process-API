import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';

const handleNotify = async (
  thread: Thread<TelegramThreadState>,
  wallet: string
) => {
  const data = await selectAccountNotification(wallet);

  const enabled = !(data?.notify_enabled ?? false);
  await upsertAccountNotification({
    wallet,
    notify_enabled: enabled,
  });

  const text = enabled
    ? "🔔 Airdrop notifications are now ON. I'll let you know any time someone sends your wallet an airdrop."
    : '🔕 Airdrop notifications are now OFF. You can turn them back on anytime with /notify.';
  await thread.post(text);
};

export default handleNotify;
