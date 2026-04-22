import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import { upsertProfile } from '@/lib/supabase/in_process_artists/upsertProfile';
import { logMessage } from '@/lib/messages/logMessage';
import type { Address } from 'viem';

const handleRemind = async (
  thread: Thread<TelegramThreadState>,
  chatId: string,
  artistAddress: Address,
  currentNudgeEnabled: boolean
) => {
  const enabled = !currentNudgeEnabled;
  const { error } = await upsertProfile({
    address: artistAddress,
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
    chatId,
    artistAddress,
    'telegram'
  );
};

export default handleRemind;
