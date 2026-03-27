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
    userName: process.env.TELEGRAM_CHAT_BOT_USERNAME!,
    adapters: { telegram: telegramAdapter },
    state: createMemoryState(),
    onLockConflict: 'force',
  });

  return { bot, telegramAdapter };
}

export type { TelegramChatBot } from '@/types/telegram';

const { bot: telegramChatBot, telegramAdapter } = createTelegramChatBot();

export { telegramAdapter };
export default telegramChatBot;
