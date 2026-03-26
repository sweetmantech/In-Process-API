import { after } from 'next/server';
import type { Address } from 'viem';
import type { Thread, Message, Attachment } from 'chat';
import extractTelegramFileIds from './extractTelegramFileIds';
import processTelegramMedia from './processTelegramMedia';
import isTooBigForTelegram, { TOO_BIG_MESSAGE } from './isTooBigForTelegram';
import type { TelegramThreadState } from './telegramThreadState';
import prepareMediaGroupAsset from './prepareMediaGroupAsset';
import processMediaGroup from './processMediaGroup';

const DEBOUNCE_DELAY_MS = 2_000;

const handleTelegramMedia = async (
  thread: Thread<TelegramThreadState>,
  message: Message,
  attachment: Attachment,
  text: string,
  artistAddress: Address
) => {
  if (isTooBigForTelegram(attachment)) {
    await thread.post(TOO_BIG_MESSAGE);
    return;
  }

  const { fileId, thumbFileId } = extractTelegramFileIds(message);
  const title = text || `untitled-${Date.now()}`;
  const raw = message.raw as { media_group_id?: string };
  const mediaGroupId = raw.media_group_id;

  if (!mediaGroupId) {
    await thread.post(
      '⏳ In Process will post your moment. Please wait a few seconds...'
    );
    await thread.startTyping();
    const typingInterval = setInterval(() => void thread.startTyping(), 4000);
    try {
      await processTelegramMedia(
        thread,
        attachment,
        fileId,
        title,
        artistAddress,
        thumbFileId
      );
    } finally {
      clearInterval(typingInterval);
    }
    return;
  }

  // Media group: send ⏳ only on the first asset (atomic check)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateAdapter = (thread as any)._stateAdapter;
  const isFirst = await stateAdapter.setIfNotExists(
    `media_group:${mediaGroupId}`,
    true,
    60_000
  );
  if (isFirst) {
    await thread.post(
      '⏳ In Process will post your moment. Please wait a few seconds...'
    );
  }

  // Upload to Arweave and store prepared input
  await prepareMediaGroupAsset(
    thread,
    attachment,
    fileId,
    title,
    artistAddress,
    mediaGroupId,
    thumbFileId
  );

  // Register with after() so the serverless function stays alive.
  // Each webhook waits DEBOUNCE_DELAY_MS, then the first to acquire the
  // process lock processes all collected assets.
  after(async () => {
    await new Promise<void>((resolve) =>
      setTimeout(resolve, DEBOUNCE_DELAY_MS)
    );
    const acquired = await stateAdapter.setIfNotExists(
      `media_group_processed:${mediaGroupId}`,
      true,
      60_000
    );
    if (!acquired) return;
    await processMediaGroup(thread, mediaGroupId, artistAddress).catch(
      (err) => {
        console.error('[handleTelegramMedia] processMediaGroup error:', err);
        void thread.post(
          `❌ ${err instanceof Error ? err.message : 'Something went wrong.'}`
        );
      }
    );
  });
};

export default handleTelegramMedia;
