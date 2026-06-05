import { Address, zeroAddress, type Hex } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { FACTORY_ADDRESSES } from '@/lib/protocolSdk/create/factory-addresses';
import topicToAddress from './topicToAddress';
import selectCollections from '../supabase/in_process_collections/selectCollections';
import type { Transfers_t } from '@/types/envio';
import getPrimaryWallet from '../wallets/getPrimaryWallet';
import { Tables } from '../supabase/types';

const TRANSFER_SINGLE_TOPIC =
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';

const getAirdropOperator = async (
  t: Transfers_t
): Promise<{
  address: string;
  username: string | null;
}> => {
  const chainId = t.chain_id;
  const collectionLc = t.collection.toLowerCase();
  const recipientLc = t.recipient.toLowerCase();
  const client = getPublicClient(chainId);
  const receipt = await client.getTransactionReceipt({
    hash: t.transaction_hash as Hex,
  });
  const log = receipt.logs.find((l) => {
    if (l.topics[0]?.toLowerCase() !== TRANSFER_SINGLE_TOPIC) return false;
    if (!l.address || l.address.toLowerCase() !== collectionLc) return false;
    const from = topicToAddress(l.topics[2]);
    if (from !== zeroAddress) return false;
    const to = topicToAddress(l.topics[3]);
    return to !== null && to.toLowerCase() === recipientLc;
  });
  const address = topicToAddress(log?.topics[1]);
  if (!address) {
    throw new Error('Airdrop mint TransferSingle log not found');
  }
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

  const { data: wallets } = await selectWallets({ addresses: [address] });
  const artistAddress = getPrimaryWallet(
    (wallets ?? []).filter(
      (w) => w.type !== 'smart'
    ) as Tables<'in_process_wallets'>[]
  ) as Address | undefined;

  const artistUsername = wallets?.[0]?.artist?.username ?? null;

  if (!artistAddress) throw new Error('Airdrop operator not found');

  return {
    address: artistAddress,
    username: artistUsername,
  };
};

export default getAirdropOperator;
