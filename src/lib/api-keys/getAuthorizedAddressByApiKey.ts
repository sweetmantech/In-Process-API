import { supabase } from '@/lib/supabase/client';
import { hashApiKey } from './hashApiKey';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';

export async function getAuthorizedAddressByApiKey(
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const keyHash = hashApiKey(apiKey, PRIVY_PROJECT_SECRET);

  const { data, error } = await supabase
    .from('in_process_api_keys')
    .select('artist_id')
    .eq('key_hash', keyHash)
    .single();

  if (error || !data) {
    throw new Error('Invalid API key');
  }

  if (!data.artist_id) {
    throw new Error('No artist linked to this API key');
  }

  // Resolve a wallet address for the artist. Prefer the user-facing
  // external wallet; fall back to any wallet owned by the artist.
  const { data: walletRows, error: walletError } = await supabase
    .from('in_process_wallets')
    .select('address, type')
    .eq('artist', data.artist_id);

  if (walletError) {
    throw new Error('Failed to resolve artist wallet');
  }
  if (!walletRows?.length) {
    throw new Error('No wallet linked to this API key');
  }

  const external = walletRows.find((w) => w.type === 'external');
  return (external ?? walletRows[0]).address;
}
