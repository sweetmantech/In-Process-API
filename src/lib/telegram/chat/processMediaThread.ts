import type { Thread, Message, Attachment } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import type { ArtistContext } from '@/types/artist';
import extractTelegramFileIds from './extractTelegramFileIds';
import isTooBigForTelegram, { TOO_BIG_MESSAGE } from './isTooBigForTelegram';
import processSingleMedia from './processSingleMedia';
import processGroupMedia from './processGroupMedia';

const processMediaThread = async (
  thread: Thread<TelegramThreadState>,
  message: Message,
  attachment: Attachment,
  text: string,
  artist: ArtistContext | null
): Promise<void> => {
  if (!artist) return;
  if (isTooBigForTelegram(attachment)) {
    await thread.post(TOO_BIG_MESSAGE);
    return;
  }

  const { fileId, thumbFileId } = extractTelegramFileIds(message);
  const title = text || '';
  const raw = message.raw as { media_group_id?: string; date?: number };
  const mediaGroupId = raw.media_group_id;

  if (!mediaGroupId) {
    await processSingleMedia(
      thread,
      attachment,
      fileId,
      title,
      artist,
      thumbFileId
    );
    return;
  }

  await processGroupMedia(
    thread,
    attachment,
    fileId,
    title,
    artist,
    mediaGroupId,
    raw.date,
    thumbFileId
  );
};

export default processMediaThread;
