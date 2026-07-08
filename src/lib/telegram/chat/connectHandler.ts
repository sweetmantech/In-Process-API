import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import getPendingEmail from './getPendingEmail';
import promptTelegramEmail from './promptTelegramEmail';
import connectTelegramToAccount from './connectTelegramToAccount';

const connectHandler = async (
  text: string,
  thread: Thread<TelegramThreadState>,
  telegramUsername: string
): Promise<void> => {
  if (await getPendingEmail(thread)) {
    await connectTelegramToAccount(thread, text, telegramUsername);
  } else {
    await promptTelegramEmail(thread);
  }
};

export default connectHandler;
