import { sendPhoto } from './sendPhoto';
import type { MessageAttachment } from '@/types/telegram';

export type { MessageAttachment, RawMediaFile } from '@/types/telegram';

export const sendMessageAttachment = async (
  attachment: MessageAttachment
): Promise<void> => {
  const { buffer, caption } = attachment;
  await sendPhoto(buffer, caption);
};
