import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramChatBot } from '../bot';
import type { TelegramThreadState } from '../telegramThreadState';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import parseTelegramChatId from '@/lib/telegram/parseTelegramChatId';
import commandsHandler from '../commands/commandsHandler';
import processMediaThread from '../processMediaThread';
import youtubeParser from '@/lib/link/youtubeParser';
import processYoutubeLink from '../processYoutubeLink';

const YOUTUBE_URL_REGEX =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/)|youtu\.be\/)[\w-]+[^\s]*/i;

export function registerOnNewMention(bot: TelegramChatBot) {
  bot.onNewMention(async (rawThread, message) => {
    const thread = rawThread as Thread<TelegramThreadState>;
    try {
      const telegramUsername = message.author.userName;
      if (!telegramUsername) return;

      const { data } = await selectArtists({
        telegram: telegramUsername,
      });
      const artist = data?.[0] ?? null;
      const text = message.text?.trim() ?? '';

      if (artist) {
        await upsertAccountNotification({
          artist_address: artist.address as Address,
          telegram_chat_id: parseTelegramChatId(thread.channelId),
        });
      }

      const handled = await commandsHandler(
        text,
        thread,
        telegramUsername,
        artist
      );
      if (handled) return;

      const artistAddress = artist!.address as Address;

      const attachment = message.attachments?.[0];
      if (
        attachment &&
        (attachment.type === 'image' || attachment.type === 'video')
      ) {
        await processMediaThread(
          thread,
          message,
          attachment,
          text,
          artistAddress
        );
        return;
      }

      const youtubeUrl = text.match(YOUTUBE_URL_REGEX)?.[0];
      if (youtubeUrl && youtubeParser(youtubeUrl)) {
        await processYoutubeLink(thread, youtubeUrl, artistAddress);
        return;
      }

      await thread.post('Please send a photo or video with a caption.');
    } catch (error) {
      console.error('[telegram-dm] onDirectMessage error:', error);
      await thread.post(`❌ something went wrong: ${error}`);
    }
  });
}
