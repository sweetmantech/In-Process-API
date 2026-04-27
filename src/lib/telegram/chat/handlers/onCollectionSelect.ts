import { getAddress, isAddress } from 'viem';
import type { Thread } from 'chat';
import type { TelegramChatBot } from '../bot';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { COLLECTION_SELECT_ACTION_ID } from '../consts';
import type { TelegramThreadState } from '../telegramThreadState';
import setSelectedCollectionAddress from '../setSelectedCollectionAddress';

export function registerOnCollectionSelect(bot: TelegramChatBot) {
  bot.onAction(COLLECTION_SELECT_ACTION_ID, async (event) => {
    const address = event.value?.trim();
    if (!address || !isAddress(address)) return;

    const thread = event.thread as Thread<TelegramThreadState> | null;
    if (!thread) return;

    const telegramUsername = event.user.userName;
    if (!telegramUsername) return;

    const { data: artists } = await selectArtists({
      telegram_username: telegramUsername,
    });
    const artist = artists?.[0];
    if (!artist) return;

    const normalized = getAddress(address);
    await setSelectedCollectionAddress(thread, normalized);

    const text = `Next moment will be created in this collection:\n\`${normalized}\`\n\nSend a photo, video, YouTube link to create.`;
    await thread.post(text);
  });
}
