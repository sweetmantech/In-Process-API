import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import getStateAdapter, { TELEGRAM_PENDING_CODE_KEY } from './stateAdapter';
import { TELEGRAM_PENDING_CODE_TTL_MS } from './consts';
import type { PendingCode } from './getPendingCode';

async function setPendingCode(
  thread: Thread<TelegramThreadState>,
  pending: PendingCode
): Promise<void> {
  await getStateAdapter(thread).set(
    TELEGRAM_PENDING_CODE_KEY,
    pending,
    TELEGRAM_PENDING_CODE_TTL_MS
  );
}

export default setPendingCode;
