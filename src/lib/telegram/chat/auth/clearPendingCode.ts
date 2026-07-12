import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_PENDING_CODE_KEY,
} from '@/lib/telegram/chat/stateAdapter';

async function clearPendingCode(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await getStateAdapter(thread).delete(TELEGRAM_PENDING_CODE_KEY);
}

export default clearPendingCode;
