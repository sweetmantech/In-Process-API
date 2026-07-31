import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_PENDING_TEXT_KEY,
} from '@/lib/telegram/chat/stateAdapter';

async function getPendingTextBody(
  thread: Thread<TelegramThreadState>
): Promise<string | null> {
  const v = await getStateAdapter(thread).get(TELEGRAM_PENDING_TEXT_KEY);
  return typeof v === 'string' && v.length > 0 ? v : null;
}

export default getPendingTextBody;
