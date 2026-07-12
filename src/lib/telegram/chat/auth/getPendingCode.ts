import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_PENDING_CODE_KEY,
} from '@/lib/telegram/chat/stateAdapter';

export interface PendingCode {
  email: string;
  artistId: string | null;
  username: string | null;
}

async function getPendingCode(
  thread: Thread<TelegramThreadState>
): Promise<PendingCode | null> {
  const v = await getStateAdapter(thread).get(TELEGRAM_PENDING_CODE_KEY);
  return (v as PendingCode | null) ?? null;
}

export default getPendingCode;
