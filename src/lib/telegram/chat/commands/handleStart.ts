import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';

const handleStart = async (
  thread: Thread<TelegramThreadState>,
  artistUsername: string | null,
  telegramUsername: string
) => {
  const text = `Hello ${artistUsername || telegramUsername}! Your Telegram is connected. You can now send photos, videos, or YouTube links to create moments.`;
  await thread.post(text);
};

export default handleStart;
