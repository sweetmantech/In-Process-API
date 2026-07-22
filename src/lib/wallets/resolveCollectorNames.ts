import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { upsertArtistNames } from '@/lib/supabase/in_process_artists/upsertArtistNames';
import resolveAddressDisplayName from '@/lib/artists/resolveAddressDisplayName';

const resolveCollectorNames = async (addresses: string[]): Promise<void> => {
  if (!addresses.length) return;

  const normalized = [...new Set(addresses.map((a) => a.toLowerCase()))];
  const { data: wallets } = await selectWallets({ addresses: normalized });
  const namedAddresses = new Set(
    (wallets ?? [])
      .filter((wallet) => wallet.artist?.username)
      .map((wallet) => wallet.address)
  );
  const unnamed = normalized.filter((address) => !namedAddresses.has(address));
  if (!unnamed.length) return;

  const collectorNamesByAddresses = new Map<string, string>();
  await Promise.all(
    unnamed.map(async (address) => {
      const resolvedName = await resolveAddressDisplayName(address);
      if (resolvedName) collectorNamesByAddresses.set(address, resolvedName);
    })
  );

  await upsertArtistNames(collectorNamesByAddresses);
};

export default resolveCollectorNames;
