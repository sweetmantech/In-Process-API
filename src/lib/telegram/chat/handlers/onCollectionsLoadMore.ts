import type { TelegramChatBot } from '../bot';
import { Card, Actions, Button } from 'chat';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import {
  COLLECTION_SELECT_ACTION_ID,
  COLLECTIONS_LOAD_MORE_ACTION_ID,
} from '../consts';
import truncateTelegramButtonLabel from '../../truncateTelegramButtonLabel';
import { CHAIN_ID } from '@/lib/consts';

export function registerOnCollectionsLoadMore(bot: TelegramChatBot) {
  bot.onAction(COLLECTIONS_LOAD_MORE_ACTION_ID, async (event) => {
    const page = parseInt(event.value?.trim() ?? '', 10);
    if (!page || isNaN(page)) return;

    const thread = event.thread;
    if (!thread) return;

    const telegramUsername = event.user.userName;
    if (!telegramUsername) return;

    const { data: artists } = await selectArtists({
      telegram_username: telegramUsername,
    });
    const artist = artists?.[0];
    if (!artist) return;

    const { data, count, error } = await selectCollections({
      artist: artist.address,
      chainId: CHAIN_ID,
      limit: 20,
      page,
    });
    if (error) throw error;

    const list = data ?? [];
    if (list.length === 0) return;

    const total = count ?? list.length;
    const hasMore = total > page * 20;

    const children = [
      ...list.map((c) =>
        Actions([
          Button({
            id: COLLECTION_SELECT_ACTION_ID,
            label: truncateTelegramButtonLabel(c.name),
            value: c.address,
          }),
        ])
      ),
    ];

    if (hasMore) {
      children.push(
        Actions([
          Button({
            id: COLLECTIONS_LOAD_MORE_ACTION_ID,
            label: 'Load more',
            value: String(page + 1),
          }),
        ])
      );
    }

    await thread.post(Card({ title: 'Select a collection', children }));
  });
}
