import { NextRequest, NextResponse } from 'next/server';
import {
  getNounsProposalActionSchema,
  GetNounsProposalActionInput,
} from '@/lib/schema/getNounsProposalActionSchema';
import { validate } from '@/lib/schema/validate';

const validateGetNounsProposalActionBody = async (
  req: NextRequest
): Promise<GetNounsProposalActionInput | NextResponse> => {
  const body = await req.json();
  const result = validate(getNounsProposalActionSchema, body);
  if (!result.success) return result.response;
  return result.data;
};

export default validateGetNounsProposalActionBody;
