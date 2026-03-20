import { Chat } from 'chat';
import { createTelegramAdapter } from '@chat-adapter/telegram';
import { createMemoryState } from '@chat-adapter/state-memory';
import { validateTelegramChatEnv } from './validateEnv';

export function createTelegramChatBot() {
  validateTelegramChatEnv();

  const telegramAdapter = createTelegramAdapter({
    botToken: process.env.TELEGRAM_CHAT_BOT_TOKEN,
    secretToken: process.env.TELEGRAM_CHAT_WEBHOOK_SECRET_TOKEN,
    mode: 'webhook',
  });

  const bot = new Chat({
    userName: process.env.TELEGRAM_CHAT_BOT_USERNAME ?? 'in_process_chat_bot',
    adapters: { telegram: telegramAdapter },
    state: createMemoryState(),
  });

  return { bot, telegramAdapter };
}

export type TelegramChatBot = ReturnType<typeof createTelegramChatBot>['bot'];

const { bot: telegramChatBot, telegramAdapter } = createTelegramChatBot();

export { telegramAdapter };
export default telegramChatBot;
