import { getAddress, isAddress, type Address } from 'viem';

const CLIENT_TYPE_PREFIX = 'client-type:';
const ALLOWED_CLIENT_TYPES = new Set(['farcaster', 'external']);

const parseWalletConnectMessage = (
  message: string
): { address: Address; clientType: string } => {
  const lines = message
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length !== 2) {
    throw new Error('Invalid wallet connect message format');
  }

  const [addressLine, clientTypeLine] = lines;

  if (!isAddress(addressLine))
    throw new Error('Invalid wallet address in message');

  if (!clientTypeLine.startsWith(CLIENT_TYPE_PREFIX)) {
    throw new Error('Missing client-type in message');
  }

  const clientType = clientTypeLine.slice(CLIENT_TYPE_PREFIX.length).trim();
  if (!ALLOWED_CLIENT_TYPES.has(clientType)) {
    throw new Error('Invalid client-type in message');
  }

  return {
    address: getAddress(addressLine),
    clientType,
  };
};

export default parseWalletConnectMessage;
