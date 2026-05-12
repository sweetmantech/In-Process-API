import type { Address } from 'viem';
import type { Thread, Attachment } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import fetchTelegramFile from './fetchTelegramFile';
import processAttachmentUpload from './processAttachmentUpload';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import replyAfterSuccess from './replyAfterSuccess';
import type { PendingMediaGroupAsset } from '@/types/telegram';
import clearSelectedCollectionAddress from './clearSelectedCollectionAddress';
import getSelectedCollectionAddress from './getSelectedCollectionAddress';
import getStateAdapter from './stateAdapter';
import buildCreateBatchInput from './buildCreateBatchInput';

const createMomentsFromGroup = async (
  thread: Thread<TelegramThreadState>,
  mediaGroupId: string,
  artistAddress: Address
): Promise<void> => {
  const stateAdapter = getStateAdapter(thread);
  const pending = (await stateAdapter.getList(
    `media_group_assets:${mediaGroupId}`
  )) as PendingMediaGroupAsset[];

  if (pending.length === 0) return;

  const selectedCollection = await getSelectedCollectionAddress(thread);

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
          artistAddress,
          asset.thumbFileId
        );
      })
    );

    const batchInput = buildCreateBatchInput(
      pending,
      uploaded,
      selectedCollection,
      artistAddress
    );

    const { contractAddress, tokenIds } = await createMomentBatch(batchInput);
    if (selectedCollection) {
      await clearSelectedCollectionAddress(thread);
    }
    await Promise.all(
      tokenIds.map((tokenId, i) =>
        replyAfterSuccess(
          thread,
          contractAddress.toString(),
          tokenId,
          artistAddress,
          i === tokenIds.length - 1
        )
      )
    );
  } finally {
    clearInterval(typingInterval);
  }
};

export default createMomentsFromGroup;
