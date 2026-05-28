import { recoverMessageAddress } from 'viem';
import { Address } from 'viem';
import parseWalletConnectMessage from './parseWalletConnectMessage';

const verifyWalletConnectAuth = async (
  message: string,
  signature: string
): Promise<{ address: Address; clientType: string }> => {
  const { address, clientType } = parseWalletConnectMessage(message);

  const recovered = await recoverMessageAddress({
    message,
    signature: signature as `0x${string}`,
  });

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Invalid wallet connect signature');
  }

  return { address, clientType };
};

export default verifyWalletConnectAuth;
