import {
  zoraCreator1155FactoryImplABI,
  zoraCreator1155ImplABI,
} from '@zoralabs/protocol-deployments';
import { Address, getAddress, Log, parseEventLogs } from 'viem';

const parseMomentsTransaction = (
  logs: Log[]
): { contractAddress: Address; tokenId: string }[] => {
  const factoryLogs = parseEventLogs({
    abi: zoraCreator1155FactoryImplABI,
    logs,
    eventName: 'SetupNewContract',
  });

  const tokenLogs = parseEventLogs({
    abi: zoraCreator1155ImplABI,
    logs,
    eventName: 'SetupNewToken',
  });

  const tokenByContract = new Map(
    tokenLogs.map((l) => [l.address.toLowerCase(), l])
  );

  return factoryLogs.map((fl) => {
    const contractAddress = (fl.args as { newContract: Address }).newContract;
    const tokenLog = tokenByContract.get(contractAddress.toLowerCase());
    if (!tokenLog) {
      throw new Error(
        `SetupNewToken not found for contract ${contractAddress}`
      );
    }
    return {
      contractAddress: getAddress(contractAddress),
      tokenId: (tokenLog.args as { tokenId: bigint }).tokenId.toString(),
    };
  });
};

export default parseMomentsTransaction;
