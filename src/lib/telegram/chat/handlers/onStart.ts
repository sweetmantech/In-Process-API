import type { TelegramChatBot } from '../bot';

export function registerOnStart(bot: TelegramChatBot) {
  bot.onNewMessage(/^\/start$/, async (thread) => {
    try {
      await thread.post(
        '🎨 Welcome to In-Process Bot!\n\n' +
          'I help manage digital moments (NFTs), collections, and artist profiles on the In-Process platform.\n\n' +
          'Available commands:\n' +
          '/help - Show help\n' +
          '/status - Check bot status'
      );
    } catch (error) {
      console.error('[telegram-chat] onStart error:', error);
    }
  });
}
