import type { Attachment, Message } from 'chat';
import resolveMediaAttachmentType from './resolveMediaAttachmentType';
import extractTelegramFileIds from './extractTelegramFileIds';
import fetchTelegramFile from './fetchTelegramFile';
import needsMimeSniff from './needsMimeSniff';

const resolveTelegramMediaAttachment = async (
  message: Message,
  attachment: Attachment
): Promise<Attachment | undefined> => {
  const directType = resolveMediaAttachmentType(attachment);
  if (directType) return { ...attachment, type: directType };

  if (!needsMimeSniff(attachment)) return undefined;

  const { fileId } = extractTelegramFileIds(message, attachment);
  const { mimeType } = await fetchTelegramFile(fileId);
  const sniffed = { ...attachment, mimeType };
  const sniffedType = resolveMediaAttachmentType(sniffed);
  if (!sniffedType) return undefined;

  return { ...sniffed, type: sniffedType };
};

export default resolveTelegramMediaAttachment;
