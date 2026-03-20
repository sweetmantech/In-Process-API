import type { TelegramChatBot } from '../bot';

export function registerOnNewMention(bot: TelegramChatBot) {
  bot.onNewMention(async (thread, message) => {
    try {
      const text = message.text?.trim() ?? '';

      if (!text || /^@\w+\s*$/.test(text)) {
        await thread.post('👋 Hello! I am In-Process Bot. How can I help you?');
        return;
      }

      await thread.post(`Received: "${text}"`);
    } catch (error) {
      console.error('[telegram-chat] onNewMention error:', error);
    }
  });
}
