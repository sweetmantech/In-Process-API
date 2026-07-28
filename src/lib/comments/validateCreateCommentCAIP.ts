import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { createCommentBodySchema } from '@/lib/schema/createCommentBodySchema';
import validateGetCollectionCAIPParams from '@/lib/collection/validateGetCollectionCAIPParams';

const validateCreateCommentCAIP = async (
  req: NextRequest,
  params: { network: string; contract: string }
) => {
  const caip = validateGetCollectionCAIPParams(params);
  if (caip instanceof NextResponse) return caip;

  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(createCommentBodySchema, body);
  if (!result.success) return result.response;

  if (
    result.data.replyTo &&
    (result.data.replyTo.contractAddress.toLowerCase() !==
      caip.collectionAddress.toLowerCase() ||
      result.data.replyTo.tokenId !== result.data.tokenId)
  ) {
    return NextResponse.json(
      {
        status: 'error',
        message:
          'replyTo contractAddress and tokenId must match the target moment',
      },
      { status: 400 }
    );
  }

  return {
    artist: authResult,
    collection: {
      address: caip.collectionAddress,
      chainId: caip.chainId,
    },
    ...result.data,
  };
};

export default validateCreateCommentCAIP;
