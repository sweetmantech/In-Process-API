import type { Address } from 'viem';
import type { Thread } from 'chat';
import { Card, Actions, Button } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import getCollectionsRpc from '@/lib/supabase/in_process_collections/getCollectionsRpc';
import {
  COLLECTION_SELECT_ACTION_ID,
  COLLECTIONS_LOAD_MORE_ACTION_ID,
} from '@/lib/telegram/chat/consts';
import truncateTelegramButtonLabel from '../../truncateTelegramButtonLabel';
import { CHAIN_ID } from '@/lib/consts';

const handleCollections = async (
  thread: Thread<TelegramThreadState>,
  artistAddress: Address
) => {
  const { data, count, error } = await getCollectionsRpc({
    artist: artistAddress,
    chainId: CHAIN_ID,
    limit: 20,
    page: 1,
  });
  if (error) throw error;

  const list = data ?? [];
  const total = count ?? list.length;

  if (list.length === 0) {
    await thread.post("You don't have any collections yet.");
    return;
  }

  const notFetched = total > list.length;

  const children = list.map((c) =>
    Actions([
      Button({
        id: COLLECTION_SELECT_ACTION_ID,
        label: truncateTelegramButtonLabel(c.name),
        value: c.address,
      }),
    ])
  );

  if (notFetched) {
    children.push(
      Actions([
        Button({
          id: COLLECTIONS_LOAD_MORE_ACTION_ID,
          label: 'Load more',
          value: '2',
        }),
      ])
    );
  }

  await thread.post(
    Card({
      title: 'Select a collection',
      children,
    })
  );
};

export default handleCollections;
