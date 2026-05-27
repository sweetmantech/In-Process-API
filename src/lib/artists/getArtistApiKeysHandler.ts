import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

const getArtistApiKeysHandler = async (artistAddress: string) => {
  const { data: walletRows } = await selectWallets({
    addresses: [artistAddress],
  });
  const artistId = walletRows?.[0]?.artist ?? null;

  const keys = await getApiKeys({ artistId });

  return Response.json({ keys });
};

export default getArtistApiKeysHandler;
