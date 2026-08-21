import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

/**
 * All wallet addresses linked to the same artist as `address`.
 * Returns [] when the address is not linked to an artist.
 */
const resolveLinkedWalletAddresses = async (
  address: string
): Promise<string[]> => {
  const normalized = address.toLowerCase();
  const { data: matched } = await selectWallets({ addresses: [normalized] });
  const artistId = matched?.[0]?.artist_id;
  if (!artistId) return [];

  const { data: linked } = await selectWallets({ artistIds: [artistId] });
  return [
    ...new Set((linked ?? []).map((wallet) => wallet.address.toLowerCase())),
  ];
};

export default resolveLinkedWalletAddresses;
