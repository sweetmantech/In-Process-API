import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import telegramEmailSchema from '@/lib/schema/telegramEmailSchema';
import getPrivyWalletAddressesByEmail from '@/lib/privy/getPrivyWalletAddressesByEmail';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import sendCodeHandler from '@/lib/oauth/sendCodeHandler';
import clearPendingEmail from './clearPendingEmail';
import setPendingCode from './setPendingCode';
import {
  TELEGRAM_INVALID_EMAIL_MESSAGE,
  TELEGRAM_CODE_SENT_MESSAGE,
} from './consts';

async function connectTelegramToAccount(
  thread: Thread<TelegramThreadState>,
  text: string
): Promise<void> {
  const result = telegramEmailSchema.safeParse(text);
  if (!result.success) {
    await thread.post(TELEGRAM_INVALID_EMAIL_MESSAGE);
    return;
  }

  const email = result.data;
  const walletAddresses = await getPrivyWalletAddressesByEmail(email);
  const artist = walletAddresses.length
    ? ((await selectWallets({ addresses: walletAddresses })).data?.find(
        (w) => w.artist
      )?.artist ?? null)
    : null;

  // Require proof the sender owns this email before linking their Telegram
  // account to it — otherwise anyone could hijack an artist's account by
  // typing in an email address they don't own. Send the code and reply
  // identically whether or not an artist was found: revealing that up front
  // would let anyone probe arbitrary emails to learn which ones have an
  // In Process account.
  await sendCodeHandler(email);
  await setPendingCode(thread, {
    email,
    artistId: artist?.id ?? null,
    username: artist?.username ?? null,
  });
  await clearPendingEmail(thread);
  await thread.post(TELEGRAM_CODE_SENT_MESSAGE);
}

export default connectTelegramToAccount;
