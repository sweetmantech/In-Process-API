import type { Address, Hex } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';

const verifyWalletConnectOnChain = async ({
  address,
  chainId,
  message,
  signature,
}: {
  address: Address;
  chainId: number;
  message: string;
  signature: Hex;
}) => {
  try {
    const valid = await getPublicClient(chainId).verifyMessage({
      address,
      message,
      signature,
    });
    return { chainId, valid };
  } catch (error) {
    return {
      chainId,
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export default verifyWalletConnectOnChain;
