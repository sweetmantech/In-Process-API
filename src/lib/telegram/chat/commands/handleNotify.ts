import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { logMessage } from '@/lib/messages/logMessage';
import type { Address } from 'viem';

const handleNotify = async (
  thread: Thread<TelegramThreadState>,
  artistAddress: Address
) => {
  const { data, error: fetchError } =
    await selectAccountNotification(artistAddress);
  if (fetchError) throw fetchError;

  const enabled = !(data?.notify_enabled ?? false);
  const { error } = await upsertAccountNotification({
    artist_address: artistAddress,
    notify_enabled: enabled,
  });
  if (error) throw error;

  const text = enabled
    ? "🔔 Airdrop notifications are now ON. I'll let you know any time someone sends your wallet an airdrop."
    : '🔕 Airdrop notifications are now OFF. You can turn them back on anytime with /notify.';
  await thread.post(text);
  await logMessage(
    [{ type: 'text', text }],
    'assistant',
    thread.channelId,
    artistAddress,
    'telegram'
  );
};

export default handleNotify;
