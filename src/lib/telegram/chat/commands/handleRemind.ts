import type { Thread } from 'chat';
import { Card, Actions, Button } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { logMessage } from '@/lib/messages/logMessage';
import type { Address } from 'viem';

export const NUDGE_PERIOD_ACTION_ID = 'remind_period';

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
    ? '🔔 Nudges are now ON. How often would you like to be reminded?'
    : '🔕 Nudges are now OFF. You can turn them back on anytime with /remind.';

  await logMessage(
    [{ type: 'text', text }],
    'assistant',
    thread.channelId,
    artistAddress,
    'telegram'
  );

  if (enabled) {
    await thread.post(
      Card({
        title: text,
        children: [
          Actions([
            Button({
              id: NUDGE_PERIOD_ACTION_ID,
              label: 'Every day',
              value: '1',
            }),
            Button({
              id: NUDGE_PERIOD_ACTION_ID,
              label: 'Every 3 days',
              value: '3',
            }),
            Button({
              id: NUDGE_PERIOD_ACTION_ID,
              label: 'Every week',
              value: '7',
            }),
          ]),
        ],
      })
    );
    return;
  }
  await thread.post(text);
};

export default handleRemind;
