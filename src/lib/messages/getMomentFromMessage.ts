import { FormattedMessage } from './formatMessages';

const MOMENT_URL_REGEX =
  /\/(?:sms|collect)\/(?:base|bsep):(0x[a-fA-F0-9]+)\/(\d+)/;

const getMomentFromMessage = (message: FormattedMessage) => {
  if (!message.parts) return null;

  for (const part of message.parts as unknown as {
    type: string;
    text?: string;
  }[]) {
    if (part.type === 'text' && part?.text) {
      const match = part.text.match(MOMENT_URL_REGEX);
      if (match) {
        return {
          collectionAddress: match[1].toLowerCase() as `0x${string}`,
          tokenId: match[2],
        };
      }
    }
  }
  return null;
};

export default getMomentFromMessage;
