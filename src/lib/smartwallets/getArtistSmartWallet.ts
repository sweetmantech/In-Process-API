import { Address } from 'viem';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

// Pure DB lookup — returns null if not found.
// Use getCanonicalSmartAccount when creation is needed.
const getArtistSmartWallet = async (
  artistId: string
): Promise<Address | null> => {
  const { data } = await selectWallets({
    artistIds: [artistId],
    type: 'smart' as any,
  });
  return (data?.[0]?.address ?? null) as Address | null;
};

export default getArtistSmartWallet;
