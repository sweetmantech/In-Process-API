import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import telegramEmailSchema from '@/lib/schema/telegramEmailSchema';
import getPrivyWalletAddressesByEmail from '@/lib/privy/getPrivyWalletAddressesByEmail';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import sendCodeHandler from '@/lib/oauth/sendCodeHandler';
import clearPendingEmail from './clearPendingEmail';
import setPendingCode from './setPendingCode';

const INVALID_EMAIL_MESSAGE =
  "That doesn't look like a valid email address. Please try again.";
const NO_ACCOUNT_FOUND_MESSAGE =
  "We couldn't find an In Process account for that email yet. Please sign up at https://inprocess.world, then reply here with your email again to connect your Telegram.";
const CODE_SENT_MESSAGE =
  "We've sent a 6-digit verification code to that email. Please reply with the code to confirm it's yours.";

async function connectTelegramToAccount(
  thread: Thread<TelegramThreadState>,
  text: string
): Promise<void> {
  const result = telegramEmailSchema.safeParse(text);
  if (!result.success) {
    await thread.post(INVALID_EMAIL_MESSAGE);
    return;
  }

  const email = result.data;
  const walletAddresses = await getPrivyWalletAddressesByEmail(email);
  const artist = walletAddresses.length
    ? ((await selectWallets({ addresses: walletAddresses })).data?.find(
        (w) => w.artist
      )?.artist ?? null)
    : null;

  if (!artist) {
    // TODO: no In Process account exists for this email/wallet yet — support
    // creating one directly from this Telegram flow instead of requiring web signup first.
    await thread.post(NO_ACCOUNT_FOUND_MESSAGE);
    return;
  }

  // Require proof the sender owns this email before linking their Telegram
  // account to it — otherwise anyone could hijack an artist's account by
  // typing in an email address they don't own.
  await sendCodeHandler(email);
  await setPendingCode(thread, {
    email,
    artistId: artist.id,
    username: artist.username,
  });
  await clearPendingEmail(thread);
  await thread.post(CODE_SENT_MESSAGE);
}

export default connectTelegramToAccount;
