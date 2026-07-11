import type { Attachment } from 'chat';

const needsMimeSniff = (attachment: Attachment): boolean =>
  attachment.type === 'file' &&
  (!attachment.mimeType || attachment.mimeType === 'application/octet-stream');

export default needsMimeSniff;
