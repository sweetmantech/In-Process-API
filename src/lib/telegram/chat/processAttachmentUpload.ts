import type { Attachment } from 'chat';
import uploadPhotoAttachment from './uploadPhotoAttachment';
import uploadVideoAttachment from './uploadVideoAttachment';

const processAttachmentUpload = async (
  attachment: Attachment,
  fileId: string,
  name: string,
  artistAddress: string,
  thumbFileId?: string
) => {
  if (attachment.type === 'image') {
    return uploadPhotoAttachment(attachment, fileId, name, artistAddress);
  }
  return uploadVideoAttachment(
    attachment,
    fileId,
    name,
    artistAddress,
    thumbFileId
  );
};

export default processAttachmentUpload;
