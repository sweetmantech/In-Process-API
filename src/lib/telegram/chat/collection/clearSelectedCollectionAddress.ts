import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_SELECTED_COLLECTION_KEY,
} from '@/lib/telegram/chat/stateAdapter';

async function clearSelectedCollectionAddress(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await getStateAdapter(thread).delete(TELEGRAM_SELECTED_COLLECTION_KEY);
}

export default clearSelectedCollectionAddress;
