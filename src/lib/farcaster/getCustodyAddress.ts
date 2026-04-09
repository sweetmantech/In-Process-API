import { bytesToHex } from 'viem';
import hubClient from '@/lib/farcaster/hubClient';

const getCustodyAddress = async (fid: bigint): Promise<string> => {
  const result = await hubClient.getIdRegistryOnChainEvent({
    fid: Number(fid),
  });
  if (result.isErr())
    throw new Error(`Failed to fetch custody address from Hub: ${result.error.message}`);
  const { idRegisterEventBody } = result.value;
  if (!idRegisterEventBody?.to?.length)
    throw new Error('No custody address found for FID');
  return bytesToHex(idRegisterEventBody.to).toLowerCase();
};

export default getCustodyAddress;
