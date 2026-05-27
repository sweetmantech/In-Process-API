import { getOrCreateSmartWallet } from '../coinbase/getOrCreateSmartWallet';
import { Address } from 'viem';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

const getSmartWalletAddress = async (address: Address) => {
  const lowercasedAddress = address.toLowerCase() as Address;

  try {
    const { data: wallets } = await selectWallets({ address: lowercasedAddress });
    const cached = wallets?.[0]?.smart_wallet_address;
    if (cached) return cached.toLowerCase() as Address;

    const smartAccount = await getOrCreateSmartWallet({
      address: lowercasedAddress,
    });
    if (!smartAccount?.address) {
      throw new Error(
        `Failed to obtain smart wallet address for ${lowercasedAddress}: getOrCreateSmartWallet returned invalid account`
      );
    }
    return smartAccount.address.toLowerCase() as Address;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object'
          ? JSON.stringify(error)
          : String(error);
    throw new Error(
      `Failed to get or create smart wallet for address ${lowercasedAddress}: ${errorMessage}`
    );
  }
};

export default getSmartWalletAddress;
