import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

const isSameArtist = async (
  addressA: string,
  addressB: string
): Promise<boolean> => {
  const { data: wallets } = await selectWallets({
    addresses: [addressA, addressB],
  });
  const artistIdA = wallets?.find((w) => w.address === addressA)?.artist_id;
  const artistIdB = wallets?.find((w) => w.address === addressB)?.artist_id;
  return Boolean(artistIdA && artistIdB && artistIdA === artistIdB);
};

export default isSameArtist;
