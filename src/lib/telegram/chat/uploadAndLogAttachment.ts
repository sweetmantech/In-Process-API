import type { Address } from 'viem';
import type { Attachment } from 'chat';
import { logMessage } from '@/lib/messages/logMessage';
import processAttachmentUpload from './processAttachmentUpload';

const uploadAndLogAttachment = async (
  attachment: Attachment,
  fileId: string,
  name: string,
  artistAddress: Address,
  roomId: string,
  thumbFileId?: string
) => {
  const uploaded = await processAttachmentUpload(
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
    roomId,
    artistAddress,
    'telegram'
  );

  return uploaded;
};

export default uploadAndLogAttachment;
