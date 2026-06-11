import { NextRequest, NextResponse } from 'next/server';
import { createNounsProposalSchema } from '@/lib/schema/createNounsProposalSchema';
import { validate } from '@/lib/schema/validate';

const validateCreateNounsProposalBody = async (req: NextRequest) => {
  const body = await req.json();
  const result = validate(createNounsProposalSchema, body);
  if (!result.success) return result.response as NextResponse;
  return result.data;
};

export default validateCreateNounsProposalBody;
