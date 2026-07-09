import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import setPendingEmail from './setPendingEmail';

const NOT_CONNECTED_MESSAGE =
  "We couldn't find an In Process account connected to this Telegram yet. To connect it, please reply with the email address you use for In Process.";

async function promptTelegramEmail(
  thread: Thread<TelegramThreadState>
): Promise<void> {
  await thread.post(NOT_CONNECTED_MESSAGE);
  await setPendingEmail(thread);
}

export default promptTelegramEmail;
