import { parseSiweMessage } from 'viem/siwe';
import { recoverMessageAddress } from 'viem';
import { getValidNonces } from '@/lib/farcaster/getValidNonces';

export async function verifyFarcasterAuth(
  message: string,
  signature: string
): Promise<string> {
  const parsed = parseSiweMessage(message);

  if (!parsed.nonce || !getValidNonces().includes(parsed.nonce)) {
    throw new Error('Expired nonce');
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
