import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import { upsertProfile } from '@/lib/supabase/in_process_artists/upsertProfile';
import { logMessage } from '@/lib/messages/logMessage';
import type { Address } from 'viem';

const handleNotify = async (
  thread: Thread<TelegramThreadState>,
  chatId: string,
  artistAddress: Address,
  currentNotifyEnabled: boolean
) => {
  const enabled = !currentNotifyEnabled;
  const { error } = await upsertProfile({
    address: artistAddress,
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
    chatId,
    artistAddress,
    'telegram'
  );
};

export default handleNotify;
