import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_PENDING_EMAIL_KEY,
} from '@/lib/telegram/chat/stateAdapter';

async function clearPendingEmail(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await getStateAdapter(thread).delete(TELEGRAM_PENDING_EMAIL_KEY);
}

export default clearPendingEmail;
