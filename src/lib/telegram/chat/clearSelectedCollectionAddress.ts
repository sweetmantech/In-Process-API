import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import getStateAdapter, {
  TELEGRAM_SELECTED_COLLECTION_KEY,
} from './stateAdapter';

async function clearSelectedCollectionAddress(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await getStateAdapter(thread).delete(TELEGRAM_SELECTED_COLLECTION_KEY);
}

export default clearSelectedCollectionAddress;
