import type { Address } from 'viem';
import { getPublicClient } from '@/lib/viem/publicClient';
import parseWalletConnectMessage from './parseWalletConnectMessage';
import { WalletType } from '@/types/wallets';

const WALLET_TYPES: WalletType[] = ['privy', 'farcaster', 'external'];

const verifyWalletConnectAuth = async (
  message: string,
  signature: string
): Promise<{ address: Address; clientType: WalletType }> => {
  const { address, clientType } = parseWalletConnectMessage(message);

  if (!WALLET_TYPES.includes(clientType as WalletType)) {
    throw new Error('Invalid wallet type');
  }

  const valid = await getPublicClient().verifyMessage({
    address,
    message,
    signature: signature as `0x${string}`,
  });

  if (!valid) {
    throw new Error('Invalid wallet connect signature');
  }

  return { address, clientType: clientType as WalletType };
};

export default verifyWalletConnectAuth;
