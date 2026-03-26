import type { Address } from 'viem';
import type { Thread, Message, Attachment } from 'chat';
import extractTelegramFileIds from './extractTelegramFileIds';
import processTelegramMedia from './processTelegramMedia';
import isTooBigForTelegram, { TOO_BIG_MESSAGE } from './isTooBigForTelegram';
import type { TelegramThreadState } from './telegramThreadState';

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
};

export default handleTelegramMedia;
