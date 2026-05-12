import type { CreateMomentContractInput } from '@/lib/schema/createMomentSchema';
import { simulateCreateMoment } from '@/lib/moment/simulateCreateMoment';

const simulateCreateMomentHandler = async (
  input: CreateMomentContractInput
) => {
  const result = await simulateCreateMoment(input);
  return Response.json(result);
};

export default simulateCreateMomentHandler;
