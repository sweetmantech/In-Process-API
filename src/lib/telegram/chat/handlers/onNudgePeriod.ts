import type { TelegramChatBot } from '@/lib/telegram/chat/bot';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import parseTelegramChatId from '@/lib/telegram/parseTelegramChatId';
import { NUDGE_PERIOD_ACTION_ID, NUDGE_PERIODS } from '@/lib/consts';
import getPrimaryWallet from '@/lib/wallets/getPrimaryWallet';
import { Tables } from '@/lib/supabase/types';

export function registerOnNudgePeriod(bot: TelegramChatBot) {
  bot.onAction(NUDGE_PERIOD_ACTION_ID, async (event) => {
    const value = event.value ?? '';
    const period = Number(value);
    if (!period || !Object.keys(NUDGE_PERIODS).includes(value)) return;

    const telegramUsername = event.user.userName;
    if (!telegramUsername) return;

    const channelId = event.thread?.channelId;
    if (!channelId) return;

    const { data } = await selectArtists({
      telegram: telegramUsername,
    });
    const artist = data?.[0];
    if (!artist) return;

    const wallets = (artist.wallets ?? []) as Tables<'in_process_wallets'>[];
    const primaryWallet = getPrimaryWallet(wallets);
    if (!primaryWallet) return;

    await upsertAccountNotification({
      wallet: primaryWallet,
      telegram_chat_id: parseTelegramChatId(channelId),
      nudge_period: period,
    });

    const { description } = NUDGE_PERIODS[value];
    await event.thread?.post(
      `✅ Got it! I'll nudge you when you haven't posted in ${description}.`
    );
  });
}
