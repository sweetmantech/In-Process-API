import {
  createMomentBatchSchema,
  type CreateWritingMomentInput,
} from '@/lib/schema/createMomentSchema';
import { convertWritingToContractSchema } from '@/lib/coinbase/convertWritingToContractSchema';
import uploadWritingWithJson from '@/lib/writing/uploadWritingWithJson';
import createMomentBatch from '@/lib/moment/createMomentBatch';

const createWritingMomentHandler = async (data: CreateWritingMomentInput) => {
  const collectionName = data.contract.address
    ? data.title
    : (data.contract.name ?? data.title);
  const metadataUri = await uploadWritingWithJson(
    collectionName,
    data.token.tokenContent
  );
  const convertedData = convertWritingToContractSchema(data, metadataUri);
  const batchInput = createMomentBatchSchema.parse({
    contract: convertedData.contract,
    tokens: [convertedData.token],
    account: convertedData.account,
    splits: convertedData.splits,
    channel: convertedData.channel,
    chainId: convertedData.chainId,
  });
  const result = await createMomentBatch(batchInput);
  return Response.json({
    contractAddress: result.contractAddress,
    tokenId: result.tokenIds[0],
    hash: result.hash,
    chainId: result.chainId,
  });
};

export default createWritingMomentHandler;
