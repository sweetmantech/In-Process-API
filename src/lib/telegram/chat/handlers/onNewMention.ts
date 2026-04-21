import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramChatBot } from '../bot';
import type { TelegramThreadState } from '../telegramThreadState';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import commandsHandler from '../commands/commandsHandler';
import processMediaThread from '../processMediaThread';
import createMomentFromYoutubeLink from '../createMomentFromYoutubeLink';
import replyAfterSuccess from '../replyAfterSuccess';
import youtubeParser from '@/lib/link/youtubeParser';

const YOUTUBE_URL_REGEX =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/)|youtu\.be\/)[\w-]+[^\s]*/i;

export function registerOnNewMention(bot: TelegramChatBot) {
  bot.onNewMention(async (rawThread, message) => {
    const thread = rawThread as Thread<TelegramThreadState>;
    try {
      const chatId = thread.channelId;

      const telegramUsername = message.author.userName;
      if (!telegramUsername) return;

      const { data } = await selectArtists({
        telegram_username: telegramUsername,
      });
      const artist = data?.[0] ?? null;
      const text = message.text?.trim() ?? '';

      const handled = await commandsHandler(
        text,
        thread,
        chatId,
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
        await thread.post(
          '⏳ In Process will post your moment. Please wait a few seconds...'
        );
        await thread.startTyping();
        const { contractAddress, tokenId } = await createMomentFromYoutubeLink(
          youtubeUrl,
          artistAddress,
          chatId
        );
        await replyAfterSuccess(
          thread,
          contractAddress,
          tokenId,
          artistAddress
        );
        return;
      }

      await thread.post('Please send a photo or video with a caption.');
    } catch (error) {
      console.error('[telegram-dm] onDirectMessage error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong.';
      await thread.post(`❌ ${errorMessage}`);
    }
  });
}
