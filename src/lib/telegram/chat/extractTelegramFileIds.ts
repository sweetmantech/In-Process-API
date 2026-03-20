import type { Message } from 'chat';

const extractTelegramFileIds = (
  message: Message
): { fileId: string; thumbFileId?: string } => {
  const raw = message.raw as {
    photo?: Array<{ file_id: string }>;
    video?: { file_id: string; thumb?: { file_id: string } };
  };

  const fileId =
    raw.photo?.[raw.photo.length - 1]?.file_id ?? raw.video?.file_id ?? '';
  const thumbFileId = raw.video?.thumb?.file_id;

  return { fileId, thumbFileId };
};

export default extractTelegramFileIds;
