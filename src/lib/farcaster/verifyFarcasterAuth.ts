import { parseSiweMessage } from 'viem/siwe';
import { recoverMessageAddress } from 'viem';
import { CHAIN_ID } from '@/lib/consts';

export async function verifyFarcasterAuth(
  message: string,
  signature: string
): Promise<string> {
  const parsed = parseSiweMessage(message);

  if (parsed.chainId !== CHAIN_ID) {
    throw new Error('Invalid chainId');
  }

  const recovered = await recoverMessageAddress({
    message,
    signature: signature as `0x${string}`,
  });

  if (recovered.toLowerCase() !== parsed.address?.toLowerCase()) {
    throw new Error('Invalid signature');
  }

  return recovered.toLowerCase();
}
