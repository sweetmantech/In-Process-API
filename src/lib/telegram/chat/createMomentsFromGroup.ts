import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import type { ArtistContext } from '@/types/artist';
import fetchTelegramFile from './fetchTelegramFile';
import processAttachmentUpload from './processAttachmentUpload';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import sendReadyMessage from './sendReadyMessage';
import sendArtistCollage from './sendArtistCollage';
import type { PendingMediaGroupAsset } from '@/types/telegram';
import clearSelectedCollectionAddress from './clearSelectedCollectionAddress';
import getCollectionAddress from './getCollectionAddress';
import getStateAdapter from './stateAdapter';
import buildCreateBatchInput from './buildCreateBatchInput';
import type { Attachment } from 'chat';

const createMomentsFromGroup = async (
  thread: Thread<TelegramThreadState>,
  mediaGroupId: string,
  artist: ArtistContext
): Promise<void> => {
  const stateAdapter = getStateAdapter(thread);
  const pending = (await stateAdapter.getList(
    `media_group_assets:${mediaGroupId}`
  )) as PendingMediaGroupAsset[];

  if (pending.length === 0) return;

  const { collectionAddress, explicitSelection } = await getCollectionAddress(
    thread,
    artist.primaryWallet
  );

  await thread.startTyping();
  const typingInterval = setInterval(() => void thread.startTyping(), 4000);
  try {
    const uploaded = await Promise.all(
      pending.map((asset) => {
        const attachment: Attachment = {
          type: asset.attachmentType,
          mimeType: asset.mimeType,
          fetchData: () =>
            fetchTelegramFile(asset.fileId).then((r) => r.buffer),
        };
        return processAttachmentUpload(
          attachment,
          asset.fileId,
          asset.name,
          asset.thumbFileId
        );
      })
    );

    const batchInput = buildCreateBatchInput(
      pending,
      uploaded,
      collectionAddress,
      artist.primaryWallet
    );

    const { contractAddress, tokenIds } = await createMomentBatch(batchInput);
    if (explicitSelection) {
      await clearSelectedCollectionAddress(thread);
    }
    await Promise.all(
      tokenIds.map((tokenId) =>
        sendReadyMessage(thread, contractAddress.toString(), tokenId)
      )
    );
    await sendArtistCollage(thread, artist.primaryWallet);
  } finally {
    clearInterval(typingInterval);
  }
};

export default createMomentsFromGroup;
