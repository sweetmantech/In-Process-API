import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import getPendingCode from '../getPendingCode';
import getPendingEmail from '../getPendingEmail';
import promptTelegramEmail from '../promptTelegramEmail';
import connectTelegramToAccount from '../connectTelegramToAccount';
import verifyTelegramCode from '../verifyTelegramCode';

const connectHandler = async (
  text: string,
  thread: Thread<TelegramThreadState>,
  telegramUsername: string
): Promise<void> => {
  const pendingCode = await getPendingCode(thread);
  if (pendingCode) {
    await verifyTelegramCode(thread, text, telegramUsername, pendingCode);
    return;
  }

  if (await getPendingEmail(thread)) {
    await connectTelegramToAccount(thread, text);
  } else {
    await promptTelegramEmail(thread);
  }
};

export default connectHandler;
