import { zeroAddress, type Hex } from 'viem';
import type { Transfers_t } from '@/types/envio';
import { getPublicClient } from '@/lib/viem/publicClient';
import topicToAddress from './topicToAddress';

const TRANSFER_SINGLE_TOPIC =
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';

const getOperatorFromTransferReceipt = async (
  t: Transfers_t
): Promise<string> => {
  const client = getPublicClient(t.chain_id);
  const receipt = await client.getTransactionReceipt({
    hash: t.transaction_hash as Hex,
  });
  const collectionLc = t.collection.toLowerCase();
  const recipientLc = t.recipient.toLowerCase();
  const log = receipt.logs.find((l) => {
    if (l.topics[0]?.toLowerCase() !== TRANSFER_SINGLE_TOPIC) return false;
    if (!l.address || l.address.toLowerCase() !== collectionLc) return false;
    const from = topicToAddress(l.topics[2]);
    if (from !== zeroAddress) return false;
    const to = topicToAddress(l.topics[3]);
    return to !== null && to.toLowerCase() === recipientLc;
  });
  const address = topicToAddress(log?.topics[1]);
  if (!address) throw new Error('Airdrop mint TransferSingle log not found');
  return address;
};

export default getOperatorFromTransferReceipt;
