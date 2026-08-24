import type { Attachment } from 'chat';

const resolveMediaAttachmentType = (
  attachment: Attachment
): 'image' | 'video' | 'audio' | undefined => {
  if (
    attachment.type === 'image' ||
    attachment.type === 'video' ||
    attachment.type === 'audio'
  ) {
    return attachment.type;
  }
  if (attachment.type === 'file' && attachment.mimeType?.startsWith('image/')) {
    return 'image';
  }
  if (attachment.type === 'file' && attachment.mimeType?.startsWith('video/')) {
    return 'video';
  }
  if (attachment.type === 'file' && attachment.mimeType?.startsWith('audio/')) {
    return 'audio';
  }
  return undefined;
};

export default resolveMediaAttachmentType;
