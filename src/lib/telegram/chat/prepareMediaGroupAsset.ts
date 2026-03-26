import type { Address } from 'viem';
import type { Thread, Attachment } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import { logMessage } from '@/lib/messages/logMessage';
import uploadTelegramAttachment from './uploadTelegramAttachment';

export interface PreparedMomentInput {
  uri: string;
  name: string;
  mediaUri: string;
  mimeType: string;
}

const ASSETS_TTL_MS = 5 * 60 * 1_000;

const prepareMediaGroupAsset = async (
  thread: Thread<TelegramThreadState>,
  attachment: Attachment,
  fileId: string,
  name: string,
  artistAddress: Address,
  mediaGroupId: string,
  thumbFileId?: string
): Promise<void> => {
  const uploaded = await uploadTelegramAttachment(
    attachment,
    fileId,
    name,
    thumbFileId
  );

  await logMessage(
    [
      { type: 'text', text: name },
      { type: 'file', url: uploaded.mediaUri, mediaType: uploaded.mimeType },
    ],
    'user',
    artistAddress,
    'telegram'
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateAdapter = (thread as any)._stateAdapter;
  await stateAdapter.appendToList(
    `media_group_assets:${mediaGroupId}`,
    {
      uri: uploaded.uri,
      name,
      mediaUri: uploaded.mediaUri,
      mimeType: uploaded.mimeType,
    } satisfies PreparedMomentInput,
    { ttlMs: ASSETS_TTL_MS }
  );
};

export default prepareMediaGroupAsset;
