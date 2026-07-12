import { getAddress, isAddress, type Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getStateAdapter, {
  TELEGRAM_SELECTED_COLLECTION_KEY,
} from '@/lib/telegram/chat/stateAdapter';

async function getSelectedCollectionAddress(
  thread: Thread<TelegramThreadState>
): Promise<Address | null> {
  const v = await getStateAdapter(thread).get(TELEGRAM_SELECTED_COLLECTION_KEY);
  if (typeof v !== 'string' || !isAddress(v)) return null;
  return getAddress(v);
}

export default getSelectedCollectionAddress;
