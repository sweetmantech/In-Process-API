import { Message } from '../types/message';

const isMomentMessage = (message: Message) => {
  const MOMENT_URL_REGEX =
    /https:\/\/inprocess\.world\/sms\/base:0x[a-fA-F0-9]+\/\d+/;
  return message.parts.some(
    (part) =>
      part.type === 'text' && part.text && MOMENT_URL_REGEX.test(part.text)
  );
};

export default isMomentMessage;
