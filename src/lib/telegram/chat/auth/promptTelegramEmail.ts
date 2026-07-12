import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import setPendingEmail from './setPendingEmail';
import { TELEGRAM_NOT_CONNECTED_MESSAGE } from '@/lib/telegram/chat/consts';

async function promptTelegramEmail(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await thread.post(TELEGRAM_NOT_CONNECTED_MESSAGE);
  await setPendingEmail(thread);
}

export default promptTelegramEmail;
