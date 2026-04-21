import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import { logMessage } from '@/lib/messages/logMessage';
import type { Address } from 'viem';

const handleStart = async (
  thread: Thread<TelegramThreadState>,
  roomId: string,
  artistAddress: Address,
  artistUsername: string | null,
  telegramUsername: string
) => {
  const text = `Hello ${artistUsername || telegramUsername}, welcome to In Process! Your telegram has been verified! You can now send photos and captions to post them on In Process.`;
  await thread.post(text);
  await logMessage(
    [{ type: 'text', text }],
    'assistant',
    roomId,
    artistAddress,
    'telegram'
  );
};

export default handleStart;
