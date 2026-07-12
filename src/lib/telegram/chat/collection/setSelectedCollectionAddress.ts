import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_SELECTED_COLLECTION_KEY,
} from '@/lib/telegram/chat/stateAdapter';

async function setSelectedCollectionAddress(
  thread: Thread<TelegramThreadState>,
  address: Address
): Promise<void> {
  await getStateAdapter(thread).set(TELEGRAM_SELECTED_COLLECTION_KEY, address);
}

export default setSelectedCollectionAddress;
