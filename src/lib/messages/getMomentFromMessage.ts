import { FormattedMessage } from './formatMessages';

const getMomentFromMessage = (message: FormattedMessage) => {
  if (!message.parts) return null;
  const MOMENT_URL_REGEX =
    /https:\/\/inprocess\.world\/sms\/base:(0x[a-fA-F0-9]+)\/(\d+)/;

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
