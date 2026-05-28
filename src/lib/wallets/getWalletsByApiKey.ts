import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { hashApiKey } from '@/lib/api-keys/hashApiKey';
import { PRIVY_PROJECT_SECRET } from '@/lib/consts';
import { Address } from 'viem';
import { WalletType } from '@/types/wallets';

export async function getWalletsByApiKey(apiKey: string) {
  const keyHash = hashApiKey(apiKey, PRIVY_PROJECT_SECRET);

  const [row] = await getApiKeys({ keyHash });

  if (!row) {
    throw new Error('Invalid API key');
  }

  if (!row.artist_id) {
    throw new Error('No artist linked to this API key');
  }

  const { data: walletRows } = await selectWallets({
    artistIds: [row.artist_id],
  });
  if (!walletRows?.length) {
    throw new Error('No wallet linked to this API key');
  }

  const externalWallet = walletRows.find((w) => w.type === 'external')?.address;
  const privyWallet = walletRows.find((w) => w.type === 'privy')?.address;

  return {
    primaryWallet:
      (externalWallet as Address) ||
      (privyWallet as Address) ||
      (walletRows[0].address as Address),
    wallets: walletRows.map((w) => ({
      address: w.address as Address,
      type: w.type as WalletType,
    })),
    artistId: row.artist_id,
  };
}
