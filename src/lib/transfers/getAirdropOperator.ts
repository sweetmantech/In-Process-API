import { zeroAddress, type Hex } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import isCoinbaseSmartWallet from '@/lib/smartwallets/isCoinbaseSmartWallet';
import { FACTORY_ADDRESSES } from '@/lib/protocolSdk/create/factory-addresses';
import topicToAddress from './topicToAddress';
import selectCollections from '../supabase/in_process_collections/selectCollections';
import type { Transfers_t } from '@/types/envio';

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

  const isCb = await isCoinbaseSmartWallet(address, chainId);

  let artistAddress: string | undefined;
  let artistUsername: string | null | undefined;

  if (isCb) {
    const { data: wallets } = await selectWallets({
      smartWalletAddress: address,
    });
    const artist = wallets?.[0]?.in_process_artists as {
      address: string;
      username: string | null;
    } | null;
    artistAddress = artist?.address;
    artistUsername = artist?.username;
  } else {
    const { data: artists } = await selectArtists({ address });
    artistAddress = artists?.[0]?.address;
    artistUsername = artists?.[0]?.username;
  }

  if (artistAddress) {
    return {
      address: artistAddress,
      username: artistUsername ?? null,
    };
  }
  throw new Error('Airdrop operator not found');
};

export default getAirdropOperator;
