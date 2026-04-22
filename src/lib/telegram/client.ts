import TelegramBot from 'node-telegram-bot-api';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}

if (!process.env.TELEGRAM_CHAT_BOT_TOKEN) {
  throw new Error('TELEGRAM_CHAT_BOT_TOKEN environment variable is required');
}

export const telegramChatBotClient = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN,
  {
    polling: false,
  }
);

telegramChatBotClient.on('error', (error: Error) => {
  console.error('Telegram chat bot client error:', error);
});

export const telegramFeedbackBotClient = new TelegramBot(
  process.env.TELEGRAM_CHAT_BOT_TOKEN,
  { polling: false }
);

telegramFeedbackBotClient.on('error', (error: Error) => {
  console.error('Telegram feedback bot client error:', error);
});

export default { telegramChatBotClient, telegramFeedbackBotClient };
