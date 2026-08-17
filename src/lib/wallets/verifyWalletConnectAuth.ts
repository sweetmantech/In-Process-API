import type { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { CHAIN_ID } from '@/lib/consts';
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

  const verifyOnChain = (chainId: number) =>
    getPublicClient(chainId).verifyMessage({
      address,
      message,
      signature: signature as `0x${string}`,
    });

  const valid =
    (await verifyOnChain(CHAIN_ID)) || (await verifyOnChain(mainnet.id));

  if (!valid) {
    throw new Error('Invalid wallet connect signature');
  }

  return { address, clientType: clientType as WalletType };
};

export default verifyWalletConnectAuth;
