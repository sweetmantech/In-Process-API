import { after } from 'next/server';
import type { Thread, Attachment } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import type { ArtistContext } from '@/types/artist';
import createMomentsFromGroup from './createMomentsFromGroup';
import getStateAdapter from './stateAdapter';
import postMomentPending from './postMomentPending';

import type { PendingMediaGroupAsset } from '@/types/telegram';

const ASSETS_TTL_MS = 5 * 60 * 1_000;
const MEDIA_GROUP_WINDOW_MS = 5_000;

const processGroupMedia = async (
  thread: Thread<TelegramThreadState>,
  attachment: Attachment,
  fileId: string,
  name: string,
  artist: ArtistContext,
  mediaGroupId: string,
  date: number | undefined,
  thumbFileId?: string
): Promise<void> => {
  const stateAdapter = getStateAdapter(thread);

  const isFirst = await stateAdapter.setIfNotExists(
    `media_group:${mediaGroupId}`,
    true,
    60_000
  );
  if (isFirst) await postMomentPending(thread);

  await stateAdapter.appendToList(
    `media_group_assets:${mediaGroupId}`,
    {
      fileId,
      thumbFileId,
      name,
      mimeType: attachment.mimeType,
      attachmentType: attachment.type,
    } satisfies PendingMediaGroupAsset,
    { ttlMs: ASSETS_TTL_MS }
  );

  const deadline =
    (date ?? Math.floor(Date.now() / 1000)) * 1000 + MEDIA_GROUP_WINDOW_MS;
  after(async () => {
    await new Promise<void>((resolve) =>
      setTimeout(resolve, Math.max(0, deadline - Date.now()))
    );
    const acquired = await stateAdapter.setIfNotExists(
      `media_group_processed:${mediaGroupId}`,
      true,
      60_000
    );
    if (!acquired) return;
    await createMomentsFromGroup(thread, mediaGroupId, artist).catch((err) => {
      console.error('[processGroupMedia] createMomentsFromGroup error:', err);
      void thread.post(
        `❌ ${err instanceof Error ? err.message : 'Something went wrong.'}`
      );
    });
  });
};

export default processGroupMedia;
