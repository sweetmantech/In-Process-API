import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_PENDING_TEXT_KEY,
} from '@/lib/telegram/chat/stateAdapter';

async function clearPendingTextBody(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await getStateAdapter(thread).delete(TELEGRAM_PENDING_TEXT_KEY);
}

export default clearPendingTextBody;
