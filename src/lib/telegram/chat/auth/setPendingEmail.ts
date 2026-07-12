import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_PENDING_EMAIL_KEY,
} from '@/lib/telegram/chat/stateAdapter';
import { TELEGRAM_PENDING_EMAIL_TTL_MS } from '@/lib/telegram/chat/consts';

async function setPendingEmail(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await getStateAdapter(thread).set(
    TELEGRAM_PENDING_EMAIL_KEY,
    true,
    TELEGRAM_PENDING_EMAIL_TTL_MS
  );
}

export default setPendingEmail;
