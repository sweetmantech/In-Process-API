import { getAddress, type Hex } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import isCoinbaseSmartWallet from '@/lib/smartwallets/isCoinbaseSmartWallet';

const TRANSFER_SINGLE_TOPIC =
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';

const ZERO_ADDRESS = getAddress('0x0000000000000000000000000000000000000000');

const topicToAddress = (topic: Hex | undefined) =>
  topic ? getAddress(`0x${topic.slice(-40)}` as Hex) : null;

const getAirdropOperator = async (
  transactionHash: Hex,
  chainId: number,
  collectionAddress: string
): Promise<{
  address: string;
  username: string | null;
}> => {
  const client = getPublicClient(chainId);
  const receipt = await client.getTransactionReceipt({ hash: transactionHash });
  const collectionLc = collectionAddress.toLowerCase();
  const log = receipt.logs.find((l) => {
    if (l.topics[0]?.toLowerCase() !== TRANSFER_SINGLE_TOPIC) return false;
    if (!l.address || l.address.toLowerCase() !== collectionLc) return false;
    const from = topicToAddress(l.topics[2]);
    return from === ZERO_ADDRESS;
  });
  if (!log?.topics[1]) {
    throw new Error('Airdrop mint TransferSingle log not found');
  }

  const address = getAddress(`0x${log.topics[1].slice(-40)}`);
  const isCb = await isCoinbaseSmartWallet(address, chainId);

  console.log('isCb', isCb, address);
  const { data: artists } = await selectArtists({
    smart_wallet: isCb ? address : undefined,
    address: isCb ? undefined : address,
  });

  if (artists?.length) {
    return {
      address: artists[0].address,
      username: artists[0].username,
    };
  }
  throw new Error('Airdrop operator not found');
};

export default getAirdropOperator;
