import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramChatBot } from '../bot';
import type { TelegramThreadState } from '../telegramThreadState';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { logMessage } from '@/lib/messages/logMessage';
import handleTelegramMedia from '../handleTelegramMedia';

export function registerOnNewMention(bot: TelegramChatBot) {
  bot.onNewMention(async (rawThread, message) => {
    const thread = rawThread as Thread<TelegramThreadState>;
    try {
      const telegramUsername = message.author.userName;
      if (!telegramUsername) return;

      const { data } = await selectArtists({
        telegram_username: telegramUsername,
      });
      const artist = data?.[0] ?? null;

      if (!artist) {
        const welcomeMessage =
          'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.';
        await logMessage(
          [{ type: 'text', text: message.text ?? '' }],
          'user',
          undefined,
          'telegram'
        );
        await thread.post(welcomeMessage);
        await logMessage(
          [{ type: 'text', text: welcomeMessage }],
          'assistant',
          undefined,
          'telegram'
        );
        return;
      }

      const artistAddress = artist.address as Address;
      const text = message.text?.trim() ?? '';

      if (text === '/start') {
        const startMessage = `Hello ${artist.username || telegramUsername}, welcome to In Process! Your telegram has been verified! You can now send photos and captions to post them on In Process.`;
        await thread.post(startMessage);
        await logMessage(
          [{ type: 'text', text: startMessage }],
          'assistant',
          artistAddress,
          'telegram'
        );
        return;
      }

      const attachment = message.attachments?.[0];
      if (
        attachment &&
        (attachment.type === 'image' || attachment.type === 'video')
      ) {
        await handleTelegramMedia(
          thread,
          message,
          attachment,
          text,
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
