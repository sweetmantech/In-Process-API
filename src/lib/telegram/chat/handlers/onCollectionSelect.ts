import type { TelegramChatBot } from '../bot';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { COLLECTION_SELECT_ACTION_ID } from '../consts';

export function registerOnCollectionSelect(bot: TelegramChatBot) {
  bot.onAction(COLLECTION_SELECT_ACTION_ID, async (event) => {
    const address = event.value?.trim();
    if (!address) return;

    const thread = event.thread;
    if (!thread) return;

    const telegramUsername = event.user.userName;
    if (!telegramUsername) return;

    const { data: artists } = await selectArtists({
      telegram_username: telegramUsername,
    });
    const artist = artists?.[0];
    if (!artist) return;

    const text = `Selected collection: ${address}`;
    await thread.post(text);
  });
}
