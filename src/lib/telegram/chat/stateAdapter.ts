import type { Thread } from 'chat';
import { TELEGRAM_SELECTED_COLLECTION_KEY } from './consts';
import type { TelegramThreadState } from './telegramThreadState';

export { TELEGRAM_SELECTED_COLLECTION_KEY };

export const getStateAdapter = (
  thread: Thread<TelegramThreadState>
): {
  get: (k: string) => Promise<unknown | null>;
  set: (k: string, v: unknown) => Promise<void>;
  delete: (k: string) => Promise<void>;
} =>
  (
    thread as unknown as {
      _stateAdapter: {
        get: (k: string) => Promise<unknown | null>;
        set: (k: string, v: unknown) => Promise<void>;
        delete: (k: string) => Promise<void>;
      };
    }
  )._stateAdapter;
