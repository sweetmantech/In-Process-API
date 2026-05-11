import createMomentBatch, {
  type CreateMomentBatchInput,
} from './createMomentBatch';

const createMomentBatchHandler = async (input: CreateMomentBatchInput) => {
  const result = await createMomentBatch(input);
  return Response.json({ moments: result });
};

export default createMomentBatchHandler;
