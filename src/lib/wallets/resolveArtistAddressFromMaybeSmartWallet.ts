import { Address } from 'viem';
import isCoinbaseSmartWallet from '@/lib/smartwallets/isCoinbaseSmartWallet';
import getSmartWalletOwnerAddresses from '@/lib/smartwallets/getSmartWalletOwnerAddresses';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getPrimaryWallet from '@/lib/wallets/getPrimaryWallet';
import { Tables } from '@/lib/supabase/types';

const resolveArtistAddressFromMaybeSmartWallet = async ({
  address,
  chainId,
}: {
  address: Address;
  chainId: number;
}): Promise<string> => {
  const normalized = address.toLowerCase();
  const isCbSmartWallet = await isCoinbaseSmartWallet(address, chainId);
  if (!isCbSmartWallet) return normalized;

  const owners = await getSmartWalletOwnerAddresses(address);
  const { data: wallets } = await selectWallets({ addresses: owners });
  const nonSmartWallets = (wallets ?? []).filter((w) => w.type !== 'smart');
  const artistAddress = getPrimaryWallet(
    nonSmartWallets as Tables<'in_process_wallets'>[]
  );

  return artistAddress?.toLowerCase() ?? normalized;
};

export default resolveArtistAddressFromMaybeSmartWallet;
