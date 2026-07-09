import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import telegramCodeSchema from '@/lib/schema/telegramCodeSchema';
import authenticatePrivyPasswordless from '@/lib/privy/authenticatePrivyPasswordless';
import ensurePrivySocialWallet from '@/lib/privy/ensurePrivySocialWallet';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import clearPendingCode from './clearPendingCode';
import type { PendingCode } from './getPendingCode';
import {
  TELEGRAM_INVALID_CODE_MESSAGE,
  telegramConnectedMessage,
} from './consts';

async function verifyTelegramCode(
  thread: Thread<TelegramThreadState>,
  text: string,
  telegramUsername: string,
  pending: PendingCode
): Promise<void> {
  const result = telegramCodeSchema.safeParse(text);
  if (!result.success) {
    await thread.post(TELEGRAM_INVALID_CODE_MESSAGE);
    return;
  }

  let authResult;
  try {
    authResult = await authenticatePrivyPasswordless(
      pending.email,
      result.data
    );
  } catch {
    await thread.post(TELEGRAM_INVALID_CODE_MESSAGE);
    return;
  }

  await clearPendingCode(thread);

  const connectedMessage = telegramConnectedMessage(pending.username);
  if (!pending.artistId) {
    const walletAddress = await ensurePrivySocialWallet(authResult);
    const artist = await getOrCreateArtist({
      address: walletAddress as Address,
      type: 'privy',
    });
    await upsertArtists({ id: artist.artistId, telegram: telegramUsername });
    await thread.post(connectedMessage);
    return;
  }

  await upsertArtists({ id: pending.artistId, telegram: telegramUsername });
  await thread.post(connectedMessage);
}

export default verifyTelegramCode;
