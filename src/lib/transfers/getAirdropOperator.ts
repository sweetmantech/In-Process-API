import { Address } from 'viem';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { FACTORY_ADDRESSES } from '@/lib/protocolSdk/create/factory-addresses';
import selectCollections from '../supabase/in_process_collections/selectCollections';
import type { Transfers_t } from '@/types/envio';
import getPrimaryWallet from '../wallets/getPrimaryWallet';
import { Tables } from '../supabase/types';
import isCoinbaseSmartWallet from '../smartwallets/isCoinbaseSmartWallet';
import getSmartWalletOwnerAddresses from '../smartwallets/getSmartWalletOwnerAddresses';
import getOperatorFromTransferReceipt from './getOperatorFromTransferReceipt';

const getAirdropOperator = async (
  t: Transfers_t
): Promise<{
  address: string;
  username: string | null;
}> => {
  const chainId = t.chain_id;
  const address = await getOperatorFromTransferReceipt(t);

  const factoryAddress =
    FACTORY_ADDRESSES[chainId as keyof typeof FACTORY_ADDRESSES];
  if (
    factoryAddress &&
    factoryAddress.toLowerCase() === address.toLowerCase()
  ) {
    const { data: collections } = await selectCollections({
      addresses: [t.collection],
      chainId,
    });
    const collection = collections?.[0];
    if (collection) {
      return {
        address: collection.creator,
        username: collection.creator_username ?? null,
      };
    }
    throw new Error('Collection not found');
  }

  const isCbSmartWallet = await isCoinbaseSmartWallet(
    address as Address,
    chainId
  );
  const lookupAddresses = isCbSmartWallet
    ? await getSmartWalletOwnerAddresses(address as Address)
    : [address];

  const { data: wallets } = await selectWallets({ addresses: lookupAddresses });
  const artistAddress = getPrimaryWallet(
    (wallets ?? []).filter(
      (w) => w.type !== 'smart'
    ) as Tables<'in_process_wallets'>[]
  ) as Address | undefined;
  const artistUsername = wallets?.[0]?.artist?.username ?? null;

  if (!artistAddress) throw new Error('Airdrop operator not found');
  return { address: artistAddress, username: artistUsername };
};

export default getAirdropOperator;
