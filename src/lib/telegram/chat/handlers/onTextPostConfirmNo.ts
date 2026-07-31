import type { ActionEvent, ActionHandler } from 'chat';
import type { TelegramChatBot } from '@/lib/telegram/chat/bot';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import {
  TEXT_POST_CONFIRM_NO_ACTION_ID,
  TELEGRAM_TEXT_POST_CANCELLED_MESSAGE,
} from '@/lib/telegram/chat/consts';
import clearPendingTextBody from '@/lib/telegram/chat/moment/clearPendingTextBody';

async function handleTextPostConfirmNo(
  event: ActionEvent<TelegramThreadState>
): Promise<void> {
  const thread = event.thread;
  if (!thread) return;

  await clearPendingTextBody(thread);
  await thread.post(TELEGRAM_TEXT_POST_CANCELLED_MESSAGE);
}

export function registerOnTextPostConfirmNo(bot: TelegramChatBot) {
  bot.onAction(
    TEXT_POST_CONFIRM_NO_ACTION_ID,
    handleTextPostConfirmNo as ActionHandler
  );
}
