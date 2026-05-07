import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';

const WELCOME_MESSAGE =
  'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.';

const handleWelcome = async (thread: Thread<TelegramThreadState>) => {
  await thread.post(WELCOME_MESSAGE);
};

export default handleWelcome;
