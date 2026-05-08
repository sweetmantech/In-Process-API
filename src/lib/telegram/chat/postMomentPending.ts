import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';

const postMomentPending = (thread: Thread<TelegramThreadState>) =>
  thread.post('Posting your moment to In Process, this may take a minute...');

export default postMomentPending;
