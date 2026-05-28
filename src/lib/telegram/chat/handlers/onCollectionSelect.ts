import { getAddress, isAddress } from 'viem';
import type { ActionEvent, ActionHandler } from 'chat';
import { Actions, Button, Card, CardText } from 'chat';
import type { TelegramChatBot } from '../bot';
import {
  COLLECTION_SELECT_ACTION_ID,
  COLLECTION_SELECTION_CANCEL_ACTION_ID,
} from '../consts';
import type { TelegramThreadState } from '../telegramThreadState';
import setSelectedCollectionAddress from '../setSelectedCollectionAddress';

async function handleCollectionSelect(
  event: ActionEvent<TelegramThreadState>
): Promise<void> {
  const address = event.value?.trim();
  if (!address || !isAddress(address)) return;

  const thread = event.thread;
  if (!thread) return;

  const normalized = getAddress(address);
  await setSelectedCollectionAddress(thread, normalized);

  const text = `Next moment will be created in this collection:\n\`${normalized}\`\n\nSend a photo, video, YouTube link to create.`;
  await thread.post(
    Card({
      children: [
        CardText(text),
        Actions([
          Button({
            id: COLLECTION_SELECTION_CANCEL_ACTION_ID,
            label: 'Cancel',
          }),
        ]),
      ],
    })
  );
}

export function registerOnCollectionSelect(bot: TelegramChatBot) {
  bot.onAction(
    COLLECTION_SELECT_ACTION_ID,
    handleCollectionSelect as ActionHandler
  );
}
