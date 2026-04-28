import { getAddress, isAddress } from 'viem';
import type { ActionEvent, ActionHandler } from 'chat';
import type { TelegramChatBot } from '../bot';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { COLLECTION_SELECT_ACTION_ID } from '../consts';
import type { TelegramThreadState } from '../telegramThreadState';
import setSelectedCollectionAddress from '../setSelectedCollectionAddress';

async function handleCollectionSelect(
  event: ActionEvent<TelegramThreadState>
): Promise<void> {
  const address = event.value?.trim();
  if (!address || !isAddress(address)) return;

  const thread = event.thread;
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
}

export function registerOnCollectionSelect(bot: TelegramChatBot) {
  bot.onAction(
    COLLECTION_SELECT_ACTION_ID,
    handleCollectionSelect as ActionHandler
  );
}
