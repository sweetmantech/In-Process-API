import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import { selectSocialWallets } from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import getArtistAddresses from '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';

const handleMe = async (
  thread: Thread<TelegramThreadState>,
  artistAddress: Address
) => {
  const { data, error } = await selectSocialWallets({ artistAddress });
  if (error) throw error;

  console.log('data', data);
  for (const { social_wallet } of data ?? []) {
    const email = await getEmailByWalletAddress(social_wallet);
    if (email) {
      await thread.post(`Your linked email: ${email}`);
      return;
    }
  }

  // artistAddress may itself be a social wallet
  const { data: rows, error: err } = await getArtistAddresses([artistAddress]);
  if (err) throw err;

  console.log('rows', rows);
  if (rows && rows.length > 0) {
    const email = await getEmailByWalletAddress(artistAddress);
    if (email) {
      await thread.post(`Your linked email: ${email}`);
      return;
    }
  }

  await thread.post('No email address linked to your account.');
};

export default handleMe;
