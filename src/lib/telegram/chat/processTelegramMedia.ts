import type { Address } from 'viem';
import type { Thread, Attachment } from 'chat';
import { logMessage } from '@/lib/messages/logMessage';
import uploadTelegramAttachment from './uploadTelegramAttachment';
import createMomentFromTelegramAttachment from './createMomentFromTelegramAttachment';
import handleMomentSuccess from './handleMomentSuccess';

const processTelegramMedia = async (
  thread: Thread,
  attachment: Attachment,
  fileId: string,
  text: string,
  artistAddress: Address,
  thumbFileId?: string
) => {
  const uploaded = await uploadTelegramAttachment(
    attachment,
    fileId,
    text,
    thumbFileId
  );

  await logMessage(
    [
      { type: 'text', text },
      { type: 'file', url: uploaded.mediaUri, mediaType: uploaded.mimeType },
    ],
    'user',
    artistAddress,
    'telegram'
  );

  const { contractAddress, tokenId } = await createMomentFromTelegramAttachment(
    {
      uri: uploaded.uri,
      name: text,
      artistAddress,
    }
  );
  await handleMomentSuccess(
    thread,
    contractAddress.toString(),
    tokenId,
    artistAddress
  );
};

export default processTelegramMedia;
