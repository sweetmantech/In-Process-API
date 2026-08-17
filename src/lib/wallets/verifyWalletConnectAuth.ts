import { isErc6492Signature, size, type Address, type Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { CHAIN_ID } from '@/lib/consts';
import parseWalletConnectMessage from './parseWalletConnectMessage';
import verifyWalletConnectOnChain from './verifyWalletConnectOnChain';
import getHasCode from './getHasCode';
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

  const signatureHex = signature as Hex;
  const primary = await verifyWalletConnectOnChain({
    address,
    chainId: CHAIN_ID,
    message,
    signature: signatureHex,
  });
  const fallback = primary.valid
    ? null
    : await verifyWalletConnectOnChain({
        address,
        chainId: mainnet.id,
        message,
        signature: signatureHex,
      });
  const valid = primary.valid || Boolean(fallback?.valid);

  if (!valid) {
    const results = fallback ? [primary, fallback] : [primary];
    const chains = await Promise.all(
      results.map(async (result) => ({
        ...result,
        hasCode: await getHasCode(result.chainId, address),
      }))
    );
    console.log('[verifyWalletConnectAuth]', {
      address,
      clientType,
      signatureBytes: size(signatureHex),
      isErc6492: isErc6492Signature(signatureHex),
      chains,
    });
    throw new Error('Invalid wallet connect signature');
  }

  return { address, clientType: clientType as WalletType };
};

export default verifyWalletConnectAuth;
