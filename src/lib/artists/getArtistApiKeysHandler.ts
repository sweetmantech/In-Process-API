import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

const getArtistApiKeysHandler = async (artistAddress: string) => {
  const { data: walletRows } = await selectWallets({
    addresses: [artistAddress],
  });
  const artistId = walletRows?.[0]?.artist ?? null;

  const { data, error } = await getApiKeys({ artistId });

  if (error) throw new Error('Failed to fetch API keys');

  return Response.json({
    keys: data || [],
  });
};

export default getArtistApiKeysHandler;
