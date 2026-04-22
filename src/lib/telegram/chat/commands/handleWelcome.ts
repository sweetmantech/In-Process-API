import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import { logMessage } from '@/lib/messages/logMessage';

const WELCOME_MESSAGE =
  'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.';

const handleWelcome = async (
  thread: Thread<TelegramThreadState>,
  chatId: string,
  userMessageText: string
) => {
  await logMessage(
    [{ type: 'text', text: userMessageText }],
    'user',
    chatId,
    undefined,
    'telegram'
  );
  await thread.post(WELCOME_MESSAGE);
  await logMessage(
    [{ type: 'text', text: WELCOME_MESSAGE }],
    'assistant',
    chatId,
    undefined,
    'telegram'
  );
};

export default handleWelcome;
