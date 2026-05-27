import getApiKeyByHash from '@/lib/supabase/in_process_api_keys/getApiKeyByHash';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { hashApiKey } from './hashApiKey';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

export async function getAuthorizedAddressByApiKey(
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const keyHash = hashApiKey(apiKey, PRIVY_PROJECT_SECRET);

  const { data, error } = await getApiKeyByHash(keyHash);

  if (error || !data) {
    throw new Error('Invalid API key');
  }

  if (!data.artist_id) {
    throw new Error('No artist linked to this API key');
  }

  // Resolve a wallet address for the artist. Prefer the user-facing
  // external wallet; fall back to any wallet owned by the artist.
  const { data: walletRows } = await selectWallets({
    artistIds: [data.artist_id],
  });
  if (!walletRows?.length) {
    throw new Error('No wallet linked to this API key');
  }

  const external = walletRows.find((w) => w.type === 'external');
  return (external ?? walletRows[0]).address;
}
