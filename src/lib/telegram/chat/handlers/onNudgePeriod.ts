import type { TelegramChatBot } from '../bot';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { NUDGE_PERIOD_ACTION_ID } from '../commands/handleRemind';

const PERIOD_LABELS: Record<string, string> = {
  '1': '1 day',
  '3': '3 days',
  '7': 'a week',
};

export function registerOnNudgePeriod(bot: TelegramChatBot) {
  bot.onAction(NUDGE_PERIOD_ACTION_ID, async (event) => {
    const value = event.value ?? '';
    const period = Number(value);
    if (!period || ![1, 3, 7].includes(period)) return;

    const telegramUsername = event.user.userName;
    if (!telegramUsername) return;

    const { data } = await selectArtists({
      telegram_username: telegramUsername,
    });
    const artist = data?.[0];
    if (!artist) return;

    const { error } = await upsertAccountNotification({
      artist_address: artist.address,
      nudge_period: period,
    });
    if (error) throw error;

    const label = PERIOD_LABELS[value];
    await event.thread?.post(
      `✅ Got it! I'll nudge you when you haven't posted in ${label}.`
    );
  });
}
