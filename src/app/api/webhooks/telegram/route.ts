import { after } from 'next/server';
import { type NextRequest } from 'next/server';
import { telegramAdapter } from '@/lib/telegram/chat/bot';
import telegramChatBot from '@/lib/telegram/chat/bot';
import '@/lib/telegram/chat/handlers/registerHandlers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  await telegramChatBot.initialize();
  return telegramAdapter.handleWebhook(req, {
    waitUntil: (p) => after(() => p),
  });
}
