import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { logMessage } from '@/lib/messages/logMessage';
import type { Address } from 'viem';

const handleRemind = async (
  thread: Thread<TelegramThreadState>,
  artistAddress: Address
) => {
  const { data, error: fetchError } =
    await selectAccountNotification(artistAddress);
  if (fetchError) throw fetchError;

  const enabled = !(data?.nudge_enabled ?? false);
  const { error } = await upsertAccountNotification({
    artist_address: artistAddress,
    nudge_enabled: enabled,
  });
  if (error) throw error;

  const text = enabled
    ? "🔔 Nudges are now ON. I'll remind you if you haven't posted in 3 or more days."
    : '🔕 Nudges are now OFF. You can turn them back on anytime with /remind.';
  await thread.post(text);
  await logMessage(
    [{ type: 'text', text }],
    'assistant',
    thread.channelId,
    artistAddress,
    'telegram'
  );
};

export default handleRemind;
