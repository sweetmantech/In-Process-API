import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';

const handleStart = async (
  thread: Thread<TelegramThreadState>,
  artistUsername: string | null,
  telegramUsername: string
) => {
  const text = `Hello ${artistUsername || telegramUsername}, welcome to In Process! Your telegram has been verified! You can now send photos and captions to post them on In Process.`;
  await thread.post(text);
};

export default handleStart;
