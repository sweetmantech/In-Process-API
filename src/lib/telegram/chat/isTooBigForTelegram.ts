import type { Attachment } from 'chat';

const TWENTY_MB = 20 * 1024 * 1024;
export const TOO_BIG_MESSAGE =
  '⚠️ Telegram has a 20MB limit. You can upload larger media here: https://inprocess.world/create';

const isTooBigForTelegram = (attachment: Attachment): boolean =>
  !!attachment.size && attachment.size > TWENTY_MB;

export default isTooBigForTelegram;
