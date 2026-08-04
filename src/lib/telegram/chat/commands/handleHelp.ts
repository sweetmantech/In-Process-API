import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import { TELEGRAM_HELP_MESSAGE } from '@/lib/telegram/chat/consts';

const handleHelp = async (thread: Thread<TelegramThreadState>) => {
  await thread.post(TELEGRAM_HELP_MESSAGE);
};

export default handleHelp;
