import type { Thread } from 'chat';
import { Card, Actions, Button } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { NUDGE_PERIOD_ACTION_ID, NUDGE_PERIODS } from '@/lib/consts';

const handleRemind = async (
  thread: Thread<TelegramThreadState>,
  wallet: string
) => {
  const data = await selectAccountNotification(wallet);

  const disabled = data?.nudge_period == null;
  await upsertAccountNotification({
    wallet,
    nudge_period: disabled ? 3 : null,
  });

  const text = disabled
    ? "🔔 Nudges are now ON. I'll remind you if you haven't posted in 3 or more days.\nWould you like to change how many days I wait before nudging?"
    : '🔕 Nudges are now OFF. You can turn them back on anytime with /remind.';

  if (disabled) {
    await thread.post(
      Card({
        title: text,
        children: [
          Actions(
            Object.entries(NUDGE_PERIODS).map(([value, { buttonLabel }]) =>
              Button({ id: NUDGE_PERIOD_ACTION_ID, label: buttonLabel, value })
            )
          ),
        ],
      })
    );
    return;
  }
  await thread.post(text);
};

export default handleRemind;
