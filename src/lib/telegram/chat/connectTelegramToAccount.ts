import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import telegramEmailSchema from '@/lib/schema/telegramEmailSchema';
import getPrivyWalletAddressesByEmail from '@/lib/privy/getPrivyWalletAddressesByEmail';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import clearPendingEmail from './clearPendingEmail';

const INVALID_EMAIL_MESSAGE =
  "That doesn't look like a valid email address. Please try again.";
const NO_ACCOUNT_FOUND_MESSAGE =
  "We couldn't find an In Process account for that email yet. Please sign up at https://inprocess.world, then reply here with your email again to connect your Telegram.";

async function connectTelegramToAccount(
  thread: Thread<TelegramThreadState>,
  text: string,
  telegramUsername: string
): Promise<void> {
  const result = telegramEmailSchema.safeParse(text);
  if (!result.success) {
    await thread.post(INVALID_EMAIL_MESSAGE);
    return;
  }

  const walletAddresses = await getPrivyWalletAddressesByEmail(result.data);
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

  await upsertArtists({ id: artist.id, telegram: telegramUsername });
  await clearPendingEmail(thread);
  await thread.post(
    `You're all set! Your Telegram is now connected to your In Process account${artist.username ? ` (${artist.username})` : ''}. You can now send photos and videos to publish moments.`
  );
}

export default connectTelegramToAccount;
