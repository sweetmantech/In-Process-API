import type { Address } from 'viem';
import type { Thread, Message, Attachment } from 'chat';
import { logMessage } from '@/lib/messages/logMessage';
import extractTelegramFileIds from './extractTelegramFileIds';
import processTelegramMedia from './processTelegramMedia';
import isTooBigForTelegram, { TOO_BIG_MESSAGE } from './isTooBigForTelegram';

const handleTelegramMedia = async (
  thread: Thread,
  message: Message,
  attachment: Attachment,
  text: string,
  artistAddress: Address
) => {
  if (isTooBigForTelegram(attachment)) {
    await thread.post(TOO_BIG_MESSAGE);
    return;
  }

  if (!text) {
    await thread.post('Please send a photo or video with a caption.');
    return;
  }

  const { fileId, thumbFileId } = extractTelegramFileIds(message);

  await logMessage([{ type: 'text', text }], 'user', artistAddress, 'telegram');
  await thread.post(
    '⏳ In Process will post your moment. Please wait a few seconds...'
  );

  await processTelegramMedia(
    thread,
    attachment,
    fileId,
    text,
    artistAddress,
    thumbFileId
  );
};

export default handleTelegramMedia;
