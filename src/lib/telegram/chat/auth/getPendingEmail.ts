import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_PENDING_EMAIL_KEY,
} from '@/lib/telegram/chat/stateAdapter';

async function getPendingEmail(
  thread: Thread<TelegramThreadState>
): Promise<boolean> {
  const v = await getStateAdapter(thread).get(TELEGRAM_PENDING_EMAIL_KEY);
  return v === true;
}

export default getPendingEmail;
