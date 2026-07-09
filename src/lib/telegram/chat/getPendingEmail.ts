import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import getStateAdapter, { TELEGRAM_PENDING_EMAIL_KEY } from './stateAdapter';

async function getPendingEmail(
  thread: Thread<TelegramThreadState>
): Promise<boolean> {
  const v = await getStateAdapter(thread).get(TELEGRAM_PENDING_EMAIL_KEY);
  return v === true;
}

export default getPendingEmail;
