import { Address } from 'viem';
import { getPublicClient } from './publicClient';
import { CHAIN_ID } from '@/lib/consts';
import { erc20MinterAddresses } from '@/lib/protocolSdk/constants';
import tortoiseMinterAbi from '@/lib/abi/tortoiseMinterAbi';

const getTortoisePlatformFee = async (): Promise<bigint> => {
  const publicClient = getPublicClient(CHAIN_ID);
  const config = await publicClient.readContract({
    address: erc20MinterAddresses[CHAIN_ID] as Address,
    abi: tortoiseMinterAbi,
    functionName: 'getTortoiseMinterConfig',
  });
  return config.platformFee;
};

export default getTortoisePlatformFee;
