import type { Attachment } from 'chat';

const resolveMediaAttachmentType = (
  attachment: Attachment
): 'image' | 'video' | undefined => {
  if (attachment.type === 'image' || attachment.type === 'video') {
    return attachment.type;
  }
  if (attachment.type === 'file' && attachment.mimeType?.startsWith('image/')) {
    return 'image';
  }
  if (attachment.type === 'file' && attachment.mimeType?.startsWith('video/')) {
    return 'video';
  }
  return undefined;
};

export default resolveMediaAttachmentType;
