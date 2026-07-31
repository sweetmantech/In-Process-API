import type { ActionEvent, ActionHandler } from 'chat';
import type { TelegramChatBot } from '@/lib/telegram/chat/bot';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import {
  TEXT_POST_CONFIRM_YES_ACTION_ID,
  TELEGRAM_TEXT_POST_EXPIRED_MESSAGE,
} from '@/lib/telegram/chat/consts';
import getPendingTextBody from '@/lib/telegram/chat/moment/getPendingTextBody';
import clearPendingTextBody from '@/lib/telegram/chat/moment/clearPendingTextBody';
import processTextMoment from '@/lib/telegram/chat/moment/processTextMoment';
import getArtistByTelegram from './getArtistByTelegram';

async function handleTextPostConfirmYes(
  event: ActionEvent<TelegramThreadState>
): Promise<void> {
  const thread = event.thread;
  if (!thread) return;

  const telegramUsername = event.user.userName;
  if (!telegramUsername) return;

  const text = await getPendingTextBody(thread);
  await clearPendingTextBody(thread);
  if (!text) {
    await thread.post(TELEGRAM_TEXT_POST_EXPIRED_MESSAGE);
    return;
  }

  const artist = await getArtistByTelegram(telegramUsername);
  if (!artist) return;

  await processTextMoment(thread, text, artist);
}

export function registerOnTextPostConfirmYes(bot: TelegramChatBot) {
  bot.onAction(
    TEXT_POST_CONFIRM_YES_ACTION_ID,
    handleTextPostConfirmYes as ActionHandler
  );
}
