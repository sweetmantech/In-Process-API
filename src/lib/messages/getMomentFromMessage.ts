import { FormattedMessage } from './formatMessages';
import { SITE_ORIGINAL_URL } from '@/lib/consts';

const getMomentFromMessage = (message: FormattedMessage) => {
  if (!message.parts) return null;
  const escapedBase = SITE_ORIGINAL_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const MOMENT_URL_REGEX = new RegExp(
    `${escapedBase}/sms/(?:base|bsep):(0x[a-fA-F0-9]+)/(\\d+)`
  );

  for (const part of message.parts as unknown as {
    type: string;
    text?: string;
  }[]) {
    if (part.type === 'text' && part?.text) {
      const match = part.text.match(MOMENT_URL_REGEX);
      if (match) {
        return {
          collectionAddress: match[1] as `0x${string}`,
          tokenId: match[2],
        };
      }
    }
  }
  return null;
};

export default getMomentFromMessage;
