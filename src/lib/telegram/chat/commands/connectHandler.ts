import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getPendingCode from '@/lib/telegram/chat/auth/getPendingCode';
import getPendingEmail from '@/lib/telegram/chat/auth/getPendingEmail';
import promptTelegramEmail from '@/lib/telegram/chat/auth/promptTelegramEmail';
import connectTelegramToAccount from '@/lib/telegram/chat/auth/connectTelegramToAccount';
import verifyTelegramCode from '@/lib/telegram/chat/auth/verifyTelegramCode';

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
