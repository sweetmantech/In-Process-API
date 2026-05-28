import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';

const handleMe = async (
  thread: Thread<TelegramThreadState>,
  artistAddress: Address
) => {
  const { data: walletRows } = await selectWallets({
    addresses: [artistAddress],
  });
  const artistId = walletRows?.[0]?.artist_id;

  if (artistId) {
    const { data: privyRows } = await selectWallets({
      artistIds: [artistId],
      type: 'privy',
    });
    for (const { address } of privyRows ?? []) {
      const email = await getEmailByWalletAddress(address);
      if (email) {
        await thread.post(`Your linked email: ${email}`);
        return;
      }
    }
  }

  // artistAddress may itself be a privy wallet
  if (walletRows?.[0]?.type === 'privy') {
    const email = await getEmailByWalletAddress(artistAddress);
    if (email) {
      await thread.post(`Your linked email: ${email}`);
      return;
    }
  }

  await thread.post('No email address linked to your account.');
};

export default handleMe;
