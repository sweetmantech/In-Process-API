import type { Thread } from 'chat';
import { Actions, Button, Card, CardText } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import setPendingTextBody from './setPendingTextBody';
import {
  TELEGRAM_TEXT_POST_PROMPT,
  TEXT_POST_CONFIRM_YES_ACTION_ID,
  TEXT_POST_CONFIRM_NO_ACTION_ID,
} from '@/lib/telegram/chat/consts';

const promptTextPostConfirmation = async (
  thread: Thread<TelegramThreadState>,
  text: string
): Promise<void> => {
  await setPendingTextBody(thread, text);
  await thread.post(
    Card({
      children: [
        CardText(TELEGRAM_TEXT_POST_PROMPT),
        Actions([
          Button({ id: TEXT_POST_CONFIRM_YES_ACTION_ID, label: 'Yes' }),
          Button({ id: TEXT_POST_CONFIRM_NO_ACTION_ID, label: 'No' }),
        ]),
      ],
    })
  );
};

export default promptTextPostConfirmation;
