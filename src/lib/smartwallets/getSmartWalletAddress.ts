import { getOrCreateSmartWallet } from '../coinbase/getOrCreateSmartWallet';
import { Address } from 'viem';
import selectArtists from '../supabase/in_process_artists/selectArtists';

const getSmartWalletAddress = async (address: Address) => {
  const lowercasedAddress = address.toLowerCase() as Address;
  const { data, error } = await selectArtists({ address: lowercasedAddress });
  if (error) throw error;
  const artist = data?.[0];

  // If artist exists and has a smart_wallet, return it (lowercased)
  if (artist && artist.smart_wallet) {
    return artist.smart_wallet.toLowerCase() as Address;
  }

  // Otherwise, create/lookup the smart wallet
  try {
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
