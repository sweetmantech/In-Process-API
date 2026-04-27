import { getAddress, type Hex } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getCoinbaseAddressOwner from '@/lib/smartwallets/getCoinbaseAddressOwner';
import isCoinbaseSmartWallet from '@/lib/smartwallets/isCoinbaseSmartWallet';

const TRANSFER_SINGLE_TOPIC =
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';

const getAirdropOperator = async (
  transactionHash: Hex,
  chainId: number
): Promise<{
  address: string;
  username: string | null;
}> => {
  const client = getPublicClient(chainId);
  const receipt = await client.getTransactionReceipt({ hash: transactionHash });
  const log = receipt.logs.find(
    (l) => l.topics[0]?.toLowerCase() === TRANSFER_SINGLE_TOPIC
  );
  if (!log?.topics[1]) throw new Error('Transfer single topic not found');

  const address = getAddress(`0x${log.topics[1].slice(-40)}`);
  const isCb = await isCoinbaseSmartWallet(address, chainId);

  console.log('isCb', isCb, address);
  const { data: artists } = await selectArtists({
    smart_wallet: isCb ? address : undefined,
    address: isCb ? undefined : address,
  });

  console.log('artists', artists);
  if (artists) {
    return {
      address: artists[0].address,
      username: artists[0].username,
    };
  }

  const ownerAddress = await getCoinbaseAddressOwner(address, chainId);

  return {
    address: ownerAddress?.toLowerCase() ?? '',
    username: null,
  };
};

export default getAirdropOperator;
