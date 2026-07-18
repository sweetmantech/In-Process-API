import { Address } from 'viem';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { getArtistSmartAccount } from '@/lib/coinbase/getArtistSmartAccount';

// Get-or-create — DB lookup first; only calls CDP when no smart wallet exists yet.
const getArtistSmartWallet = async (artistId: string): Promise<Address> => {
  const { data } = await selectWallets({
    artistIds: [artistId],
    type: 'smart' as any,
  });
  const existing = data?.[0]?.address as Address | undefined;
  if (existing) return existing;

  const smartAccount = await getArtistSmartAccount({ artistId });
  return smartAccount.address.toLowerCase() as Address;
};

export default getArtistSmartWallet;
