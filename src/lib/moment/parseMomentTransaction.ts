import {
  zoraCreator1155FactoryImplABI,
  zoraCreator1155ImplABI,
} from '@zoralabs/protocol-deployments';
import { Address, getAddress, Log, parseEventLogs } from 'viem';

const parseMomentTransaction = ({
  logs,
  isNewContract,
  existingContractAddress,
}: {
  logs: Log[];
  isNewContract: boolean;
  existingContractAddress?: string;
}): { contractAddress: Address; tokenId: string } => {
  const collectionLogs = parseEventLogs({
    abi: zoraCreator1155ImplABI,
    logs,
    eventName: 'SetupNewToken',
  });

  if (!collectionLogs[0]) {
    throw new Error('SetupNewToken event not found in transaction logs');
  }

  let contractAddress: Address;
  if (isNewContract) {
    const factoryLogs = parseEventLogs({
      abi: zoraCreator1155FactoryImplABI,
      logs,
      eventName: 'SetupNewContract',
    });
    if (!factoryLogs[0]) {
      throw new Error('SetupNewContract event not found in transaction logs');
    }
    contractAddress = (factoryLogs[0].args as { newContract: Address })
      .newContract;
  } else {
    if (!existingContractAddress) {
      throw new Error(
        'Expected contract.address when adding token to existing contract'
      );
    }
    contractAddress = getAddress(existingContractAddress);
  }

  return {
    contractAddress,
    tokenId: (collectionLogs[0].args as { tokenId: bigint }).tokenId.toString(),
  };
};

export default parseMomentTransaction;
