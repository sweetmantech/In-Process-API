import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import getStateAdapter, { TELEGRAM_PENDING_EMAIL_KEY } from './stateAdapter';
import { TELEGRAM_PENDING_EMAIL_TTL_MS } from './consts';

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
