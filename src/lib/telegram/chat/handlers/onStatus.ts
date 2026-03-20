import type { TelegramChatBot } from '../bot';

export function registerOnStatus(bot: TelegramChatBot) {
  bot.onNewMessage(/^\/status$/, async (thread) => {
    try {
      await thread.post('✅ In-Process Bot is running.');
    } catch (error) {
      console.error('[telegram-chat] onStatus error:', error);
    }
  });
}
