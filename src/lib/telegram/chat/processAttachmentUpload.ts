import type { Attachment } from 'chat';
import uploadPhotoAttachment from './uploadPhotoAttachment';
import uploadVideoAttachment from './uploadVideoAttachment';

const processAttachmentUpload = async (
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

export default processAttachmentUpload;
