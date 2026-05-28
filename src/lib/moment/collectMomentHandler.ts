import {
  type CollectMomentInput,
  collectMoment,
} from '@/lib/moment/collectMoment';

const collectMomentHandler = async (input: CollectMomentInput) => {
  const result = await collectMoment(input);
  return Response.json(result);
};

export default collectMomentHandler;
