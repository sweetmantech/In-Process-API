import type { Address, Log } from 'viem';
import type { CreateMomentBatchInput } from './createMomentBatch';
import parseSetupNewTokenEventsOnContract from './parseSetupNewTokenEventsOnContract';

const getCreatedTokenIds = ({
  logs,
  contractAddress,
  tokens,
}: {
  logs: Log[];
  contractAddress: Address;
  tokens: CreateMomentBatchInput['tokens'];
}) => {
  const parsedTokenResults = parseSetupNewTokenEventsOnContract(
    logs,
    contractAddress
  );

  return tokens.map((token) => {
    const resultIndex = parsedTokenResults.findIndex(
      (result) => result.uri === token.tokenMetadataURI
    );
    if (resultIndex === -1) {
      throw new Error(
        `SetupNewToken event not found for URI ${token.tokenMetadataURI}`
      );
    }

    const [result] = parsedTokenResults.splice(resultIndex, 1);
    return result.tokenId;
  });
};

export default getCreatedTokenIds;
