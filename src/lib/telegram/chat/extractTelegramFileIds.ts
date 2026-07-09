import type { Message, Attachment } from 'chat';

const extractTelegramFileIds = (
  message: Message,
  attachment: Attachment
): { fileId: string; thumbFileId?: string } => {
  // fetchMetadata.fileId is set uniformly by the adapter for photo, video,
  // and document messages, so this covers images/videos sent either way.
  const fileId = attachment.fetchMetadata?.fileId;
  if (!fileId) throw new Error('No Telegram media file_id found');

  const raw = message.raw as {
    video?: { thumb?: { file_id: string } };
  };
  const thumbFileId = raw.video?.thumb?.file_id;

  return { fileId, thumbFileId };
};

export default extractTelegramFileIds;
