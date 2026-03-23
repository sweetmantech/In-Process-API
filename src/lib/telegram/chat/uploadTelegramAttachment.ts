import type { Attachment } from 'chat';
import uploadPhotoAttachment from './uploadPhotoAttachment';
import uploadVideoAttachment from './uploadVideoAttachment';

const uploadTelegramAttachment = async (
  attachment: Attachment,
  fileId: string,
  name: string,
  thumbFileId?: string
) => {
  if (attachment.type === 'image') {
    return uploadPhotoAttachment(attachment, fileId, name);
  }
  return uploadVideoAttachment(attachment, fileId, name, thumbFileId);
};

export default uploadTelegramAttachment;
