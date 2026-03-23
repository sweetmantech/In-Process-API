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

  if (!text) {
    await thread.subscribe();
    await thread.setState({
      pendingMedia: {
        fileId,
        thumbFileId,
        attachmentType: attachment.type as 'image' | 'video',
        attachmentSize: attachment.size,
        artistAddress,
      },
    });
    await thread.post('📝 Please send a title for your moment:');
    return;
  }

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
