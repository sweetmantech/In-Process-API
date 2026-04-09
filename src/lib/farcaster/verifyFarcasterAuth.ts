import { parseSiweMessage } from 'viem/siwe';
import { recoverMessageAddress } from 'viem';
import { optimism } from 'viem/chains';

export async function verifyFarcasterAuth(
  message: string,
  signature: string
): Promise<string> {
  const parsed = parseSiweMessage(message);

  if (parsed.chainId !== optimism.id) {
    throw new Error('Invalid chainId');
  }

  const recovered = await recoverMessageAddress({
    message,
    signature: signature as `0x${string}`,
  });

  console.log('ziad here', parsed.address)
  if (recovered.toLowerCase() !== parsed.address?.toLowerCase()) {
    throw new Error('Invalid signature');
  }

  return recovered.toLowerCase();
}
