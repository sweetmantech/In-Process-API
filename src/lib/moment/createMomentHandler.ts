import {
  createMomentBatchSchema,
  type CreateMomentContractInput,
} from '../schema/createMomentSchema';
import createMomentBatch from './createMomentBatch';

const createMomentHandler = async (input: CreateMomentContractInput) => {
  const batchInput = createMomentBatchSchema.parse({
    contract: input.contract,
    tokens: [input.token],
    account: input.account,
    splits: input.splits,
    channel: input.channel,
  });
  const result = await createMomentBatch(batchInput);
  return Response.json({
    contractAddress: result.contractAddress,
    tokenId: result.tokenIds[0],
    hash: result.hash,
    chainId: result.chainId,
  });
};

export default createMomentHandler;
