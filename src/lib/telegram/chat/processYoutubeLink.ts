import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import createMomentFromYoutubeLink from '@/lib/telegram/chat/createMomentFromYoutubeLink';
import sendReadyMessage from '@/lib/telegram/chat/sendReadyMessage';
import sendArtistCollage from '@/lib/telegram/chat/sendArtistCollage';
import clearSelectedCollectionAddress from '@/lib/telegram/chat/clearSelectedCollectionAddress';
import getSelectedCollectionAddress from '@/lib/telegram/chat/getSelectedCollectionAddress';
import postMomentPending from '@/lib/telegram/chat/postMomentPending';

const processYoutubeLink = async (
  thread: Thread<TelegramThreadState>,
  youtubeUrl: string,
  artistAddress: Address
): Promise<void> => {
  const selectedCollection = await getSelectedCollectionAddress(thread);
  await postMomentPending(thread);
  await thread.startTyping();
  const { contractAddress, tokenId } = await createMomentFromYoutubeLink(
    youtubeUrl,
    artistAddress,
    selectedCollection ?? undefined
  );
  if (selectedCollection) {
    await clearSelectedCollectionAddress(thread);
  }
  await sendReadyMessage(thread, contractAddress, tokenId);
  await sendArtistCollage(thread, artistAddress);
};

export default processYoutubeLink;
