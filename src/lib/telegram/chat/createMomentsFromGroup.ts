import type { Address } from 'viem';
import type { Thread, Attachment } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import fetchTelegramFile from './fetchTelegramFile';
import uploadAndLogAttachment from './uploadAndLogAttachment';
import createMoments from '@/lib/moment/createMoments';
import replyAfterSuccess from './replyAfterSuccess';
import type { PendingMediaGroupAsset } from '@/types/telegram';

const createMomentsFromGroup = async (
  thread: Thread<TelegramThreadState>,
  mediaGroupId: string,
  artistAddress: Address
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateAdapter = (thread as any)._stateAdapter;
  const pending = (await stateAdapter.getList(
    `media_group_assets:${mediaGroupId}`
  )) as PendingMediaGroupAsset[];

  if (pending.length === 0) return;

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
        return uploadAndLogAttachment(
          attachment,
          asset.fileId,
          asset.name,
          artistAddress,
          thread.channelId,
          asset.thumbFileId
        );
      })
    );

    const inputs = uploaded.map((u, i) => ({
      uri: u.uri,
      name: pending[i].name,
    }));
    const results = await createMoments(inputs, artistAddress, 'telegram', {
      chatId: thread.channelId,
    });
    await Promise.all(
      results.map(({ contractAddress, tokenId }, i) =>
        replyAfterSuccess(
          thread,
          contractAddress.toString(),
          tokenId,
          artistAddress,
          i === results.length - 1
        )
      )
    );
  } finally {
    clearInterval(typingInterval);
  }
};

export default createMomentsFromGroup;
