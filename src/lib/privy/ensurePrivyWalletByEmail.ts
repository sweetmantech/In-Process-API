import type { Address } from 'viem';
import privyClient from '@/lib/privy/client';
import ensurePrivySocialWallet from '@/lib/privy/ensurePrivySocialWallet';
import getPrivyUserByEmail from '@/lib/privy/getPrivyUserByEmail';

const ensurePrivyWalletByEmail = async (email: string): Promise<Address> => {
  const normalizedEmail = email.trim().toLowerCase();

  let user = await getPrivyUserByEmail(normalizedEmail);
  if (!user) {
    user = await privyClient.users().create({
      linked_accounts: [{ type: 'email', address: normalizedEmail }],
    });
  }

  return (await ensurePrivySocialWallet({ user })) as Address;
};

export default ensurePrivyWalletByEmail;
