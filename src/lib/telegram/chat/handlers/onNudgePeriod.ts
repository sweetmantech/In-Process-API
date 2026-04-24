import type { TelegramChatBot } from '../bot';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import { NUDGE_PERIOD_ACTION_ID, NUDGE_PERIODS } from '@/lib/consts';

export function registerOnNudgePeriod(bot: TelegramChatBot) {
  bot.onAction(NUDGE_PERIOD_ACTION_ID, async (event) => {
    const value = event.value ?? '';
    const period = Number(value);
    if (!period || !Object.keys(NUDGE_PERIODS).includes(value)) return;

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

    const { description } = NUDGE_PERIODS[value];
    await event.thread?.post(
      `✅ Got it! I'll nudge you when you haven't posted in ${description}.`
    );
  });
}
