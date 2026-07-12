import type { ActionEvent, ActionHandler } from 'chat';
import type { TelegramChatBot } from '@/lib/telegram/chat/bot';
import { COLLECTION_SELECTION_CANCEL_ACTION_ID } from '@/lib/telegram/chat/consts';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import clearSelectedCollectionAddress from '@/lib/telegram/chat/collection/clearSelectedCollectionAddress';

async function handleCollectionSelectionCancel(
  event: ActionEvent<TelegramThreadState>
): Promise<void> {
  const thread = event.thread;
  if (!thread) return;

  await clearSelectedCollectionAddress(thread);
  await thread.post('The selected collection has been cancelled.');
}

export function registerOnCollectionSelectionCancel(bot: TelegramChatBot) {
  bot.onAction(
    COLLECTION_SELECTION_CANCEL_ACTION_ID,
    handleCollectionSelectionCancel as ActionHandler
  );
}
