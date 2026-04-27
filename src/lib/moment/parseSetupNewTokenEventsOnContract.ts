import { zoraCreator1155ImplABI } from '@zoralabs/protocol-deployments';
import { Address, getAddress, Log, parseEventLogs } from 'viem';

/**
 * Parses all SetupNewToken events for a known collection address (multicall on existing 1155).
 */
const parseSetupNewTokenEventsOnContract = (
  logs: Log[],
  contractAddress: Address
): { contractAddress: Address; tokenId: string; uri: string }[] => {
  const want = getAddress(contractAddress);
  const tokenLogs = parseEventLogs({
    abi: zoraCreator1155ImplABI,
    logs,
    eventName: 'SetupNewToken',
  }).filter((l) => l.address.toLowerCase() === want.toLowerCase());

  return tokenLogs.map((l) => {
    const args = l.args as { tokenId: bigint; newURI: string };
    return {
      contractAddress: want,
      tokenId: args.tokenId.toString(),
      uri: args.newURI,
    };
  });
};

export default parseSetupNewTokenEventsOnContract;
