import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import type { ArtistContext } from '@/types/artist';
import createMomentFromYoutubeLink from '@/lib/telegram/chat/createMomentFromYoutubeLink';
import sendReadyMessage from '@/lib/telegram/chat/sendReadyMessage';
import sendArtistCollage from '@/lib/telegram/chat/sendArtistCollage';
import clearSelectedCollectionAddress from '@/lib/telegram/chat/clearSelectedCollectionAddress';
import getSelectedCollectionAddress from '@/lib/telegram/chat/getSelectedCollectionAddress';
import postMomentPending from '@/lib/telegram/chat/postMomentPending';

const processYoutubeLink = async (
  thread: Thread<TelegramThreadState>,
  youtubeUrl: string,
  artist: ArtistContext | null
): Promise<void> => {
  if (!artist) return;
  const selectedCollection = await getSelectedCollectionAddress(thread);
  await postMomentPending(thread);
  await thread.startTyping();
  const { contractAddress, tokenId } = await createMomentFromYoutubeLink(
    youtubeUrl,
    artist,
    selectedCollection ?? undefined
  );
  if (selectedCollection) {
    await clearSelectedCollectionAddress(thread);
  }
  await sendReadyMessage(thread, contractAddress, tokenId);
  await sendArtistCollage(thread, artist.primaryWallet);
};

export default processYoutubeLink;
