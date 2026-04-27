import { getAddress, isAddress, type Address } from 'viem';
import type { Thread } from 'chat';
import { TELEGRAM_SELECTED_COLLECTION_KEY } from './consts';
import type { TelegramThreadState } from './telegramThreadState';

const getStateAdapter = (thread: Thread<TelegramThreadState>) =>
  (
    thread as unknown as {
      _stateAdapter: {
        get: (k: string) => Promise<unknown | null>;
        set: (k: string, v: unknown) => Promise<void>;
        delete: (k: string) => Promise<void>;
      };
    }
  )._stateAdapter;

export async function setSelectedCollectionAddress(
  thread: Thread<TelegramThreadState>,
  address: Address
): Promise<void> {
  await getStateAdapter(thread).set(TELEGRAM_SELECTED_COLLECTION_KEY, address);
}

export async function getSelectedCollectionAddress(
  thread: Thread<TelegramThreadState>
): Promise<Address | null> {
  const v = await getStateAdapter(thread).get(TELEGRAM_SELECTED_COLLECTION_KEY);
  if (typeof v !== 'string' || !isAddress(v)) return null;
  return getAddress(v);
}

export async function clearSelectedCollectionAddress(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await getStateAdapter(thread).delete(TELEGRAM_SELECTED_COLLECTION_KEY);
}
