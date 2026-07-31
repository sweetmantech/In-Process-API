import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Actions, Button, Card, CardText } from 'chat';
import promptTextPostConfirmation from '@/lib/telegram/chat/moment/promptTextPostConfirmation';
import {
  TELEGRAM_TEXT_POST_PROMPT,
  TEXT_POST_CONFIRM_YES_ACTION_ID,
  TEXT_POST_CONFIRM_NO_ACTION_ID,
} from '@/lib/telegram/chat/consts';

vi.mock('../setPendingTextBody', () => ({ default: vi.fn() }));

import setPendingTextBody from '@/lib/telegram/chat/moment/setPendingTextBody';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(setPendingTextBody).mockResolvedValue(undefined);
});

describe('promptTextPostConfirmation', () => {
  it('stores the body and posts a Yes/No confirmation card', async () => {
    const thread = makeThread();

    await promptTextPostConfirmation(thread as never, 'hello world');

    expect(setPendingTextBody).toHaveBeenCalledWith(thread, 'hello world');
    expect(thread.post).toHaveBeenCalledWith(
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
  });
});
