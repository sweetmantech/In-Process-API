import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_PENDING_TEXT_KEY,
} from '@/lib/telegram/chat/stateAdapter';
import { TELEGRAM_PENDING_TEXT_TTL_MS } from '@/lib/telegram/chat/consts';

async function setPendingTextBody(
  thread: Thread<TelegramThreadState>,
  text: string
): Promise<void> {
  await getStateAdapter(thread).set(
    TELEGRAM_PENDING_TEXT_KEY,
    text,
    TELEGRAM_PENDING_TEXT_TTL_MS
  );
}

export default setPendingTextBody;
