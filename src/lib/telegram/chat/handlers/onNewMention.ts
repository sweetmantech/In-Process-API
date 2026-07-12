import type { Thread } from 'chat';
import type { TelegramChatBot } from '@/lib/telegram/chat/bot';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import parseTelegramChatId from '@/lib/telegram/parseTelegramChatId';
import commandsHandler from '../commands/commandsHandler';
import processMediaThread from '@/lib/telegram/chat/moment/processMediaThread';
import resolveTelegramMediaAttachment from '@/lib/telegram/chat/attachment/resolveTelegramMediaAttachment';
import youtubeParser from '@/lib/link/youtubeParser';
import processYoutubeLink from '@/lib/telegram/chat/moment/processYoutubeLink';
import connectHandler from '../commands/connectHandler';
import getArtistByTelegram from './getArtistByTelegram';

const YOUTUBE_URL_REGEX =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/)|youtu\.be\/)[\w-]+[^\s]*/i;

export function registerOnNewMention(bot: TelegramChatBot) {
  bot.onNewMention(async (rawThread, message) => {
    const thread = rawThread as Thread<TelegramThreadState>;
    try {
      const telegramUsername = message.author.userName;
      if (!telegramUsername) return;

      const text = message.text?.trim() ?? '';

      const artist = await getArtistByTelegram(telegramUsername);

      if (!artist) {
        await connectHandler(text, thread, telegramUsername);
        return;
      }

      await upsertAccountNotification({
        wallet: artist.primaryWallet,
        telegram_chat_id: parseTelegramChatId(thread.channelId),
      });

      const handled = await commandsHandler(
        text,
        thread,
        telegramUsername,
        artist
      );
      if (handled) return;

      const attachment = message.attachments?.[0];
      if (attachment) {
        const resolvedAttachment = await resolveTelegramMediaAttachment(
          message,
          attachment
        );
        if (resolvedAttachment) {
          await processMediaThread(
            thread,
            message,
            resolvedAttachment,
            text,
            artist
          );
          return;
        }
      }

      const youtubeUrl = text.match(YOUTUBE_URL_REGEX)?.[0];
      if (youtubeUrl && youtubeParser(youtubeUrl)) {
        await processYoutubeLink(thread, youtubeUrl, artist);
        return;
      }

      await thread.post(
        'To post moments, please send a photo or video along with a caption, or share a YouTube link.'
      );
    } catch (error) {
      console.error('[telegram-dm] onDirectMessage error:', error);
      await thread.post(`❌ something went wrong: ${error}`);
    }
  });
}
