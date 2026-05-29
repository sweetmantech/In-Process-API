import { recoverMessageAddress } from 'viem';
import { Address } from 'viem';
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

  const recovered = await recoverMessageAddress({
    message,
    signature: signature as `0x${string}`,
  });

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Invalid wallet connect signature');
  }

  return { address, clientType: clientType as WalletType };
};

export default verifyWalletConnectAuth;
