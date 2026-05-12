import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import createMomentFromYoutubeLink from './createMomentFromYoutubeLink';
import sendReadyMessage from './sendReadyMessage';
import sendArtistCollage from './sendArtistCollage';
import clearSelectedCollectionAddress from './clearSelectedCollectionAddress';
import getSelectedCollectionAddress from './getSelectedCollectionAddress';
import postMomentPending from './postMomentPending';

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
