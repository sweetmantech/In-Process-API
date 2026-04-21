import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import { logMessage } from '@/lib/messages/logMessage';

const WELCOME_MESSAGE =
  'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.';

const handleWelcome = async (
  thread: Thread<TelegramThreadState>,
  roomId: string,
  userMessageText: string
) => {
  await logMessage(
    [{ type: 'text', text: userMessageText }],
    'user',
    roomId,
    undefined,
    'telegram'
  );
  await thread.post(WELCOME_MESSAGE);
  await logMessage(
    [{ type: 'text', text: WELCOME_MESSAGE }],
    'assistant',
    roomId,
    undefined,
    'telegram'
  );
};

export default handleWelcome;
