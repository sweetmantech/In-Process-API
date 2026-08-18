import { isAddress, type Address } from 'viem';
import ensurePrivyWalletByEmail from '@/lib/privy/ensurePrivyWalletByEmail';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';

const resolveAirdropRecipients = async (
  recipients: string[]
): Promise<Address[]> =>
  Promise.all(
    recipients.map(async (recipient) => {
      if (isAddress(recipient)) return recipient.toLowerCase() as Address;
      const privyWallet = await ensurePrivyWalletByEmail(recipient);
      const { primaryWallet } = await getOrCreateArtist({
        address: privyWallet,
        type: 'privy',
      });
      return primaryWallet;
    })
  );

export default resolveAirdropRecipients;
