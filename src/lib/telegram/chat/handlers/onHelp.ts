import type { TelegramChatBot } from '../bot';

export function registerOnHelp(bot: TelegramChatBot) {
  bot.onNewMessage(/^\/help$/, async (thread) => {
    try {
      await thread.post(
        '📚 In-Process Bot Help\n\n' +
          '• @mention the bot - Start a conversation\n' +
          '/start - Bot introduction\n' +
          '/help - Show this help\n' +
          '/status - Check bot status'
      );
    } catch (error) {
      console.error('[telegram-chat] onHelp error:', error);
    }
  });
}
