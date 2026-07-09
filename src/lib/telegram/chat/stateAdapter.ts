import type { Thread } from 'chat';
import {
  TELEGRAM_SELECTED_COLLECTION_KEY,
  TELEGRAM_PENDING_EMAIL_KEY,
  TELEGRAM_PENDING_CODE_KEY,
} from './consts';
import type { TelegramThreadState } from './telegramThreadState';

export {
  TELEGRAM_SELECTED_COLLECTION_KEY,
  TELEGRAM_PENDING_EMAIL_KEY,
  TELEGRAM_PENDING_CODE_KEY,
};

/** Subset of chat `StateAdapter` methods used by Telegram thread flows. */
export type StateAdapter = {
  get: (key: string) => Promise<unknown | null>;
  set: (key: string, value: unknown, ttlMs?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  getList: <T = unknown>(key: string) => Promise<T[]>;
  setIfNotExists: (
    key: string,
    value: unknown,
    ttlMs?: number
  ) => Promise<boolean>;
  appendToList: (
    key: string,
    value: unknown,
    options?: { maxLength?: number; ttlMs?: number }
  ) => Promise<void>;
};

type ThreadWithPrivateState = Thread<TelegramThreadState> & {
  _stateAdapter: StateAdapter;
};

export default function getStateAdapter(
  thread: Thread<TelegramThreadState>
): StateAdapter {
  return (thread as unknown as ThreadWithPrivateState)._stateAdapter;
}
