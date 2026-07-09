import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import telegramCodeSchema from '@/lib/schema/telegramCodeSchema';
import authenticatePrivyPasswordless from '@/lib/privy/authenticatePrivyPasswordless';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import clearPendingCode from './clearPendingCode';
import type { PendingCode } from './getPendingCode';

const INVALID_CODE_MESSAGE =
  "That code doesn't look right. Please check your email and try again.";

async function verifyTelegramCode(
  thread: Thread<TelegramThreadState>,
  text: string,
  telegramUsername: string,
  pending: PendingCode
): Promise<void> {
  const result = telegramCodeSchema.safeParse(text);
  if (!result.success) {
    await thread.post(INVALID_CODE_MESSAGE);
    return;
  }

  try {
    await authenticatePrivyPasswordless(pending.email, result.data);
  } catch {
    await thread.post(INVALID_CODE_MESSAGE);
    return;
  }

  await upsertArtists({ id: pending.artistId, telegram: telegramUsername });
  await clearPendingCode(thread);
  await thread.post(
    `You're all set! Your Telegram is now connected to your In Process account${pending.username ? ` (${pending.username})` : ''}. You can now send photos and videos to publish moments.`
  );
}

export default verifyTelegramCode;
