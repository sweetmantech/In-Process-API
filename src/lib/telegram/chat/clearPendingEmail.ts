import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import getStateAdapter, { TELEGRAM_PENDING_EMAIL_KEY } from './stateAdapter';

async function clearPendingEmail(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await getStateAdapter(thread).delete(TELEGRAM_PENDING_EMAIL_KEY);
}

export default clearPendingEmail;
