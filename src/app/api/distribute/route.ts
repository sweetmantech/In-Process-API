import { NextRequest } from 'next/server';
import { distributeSchema } from '@/lib/schema/distributeSchema';
import { distribute } from '@/lib/splits/distribute';
import { validate } from '@/lib/schema/validate';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const validationResult = validate(distributeSchema, body);
  if (!validationResult.success) {
    return validationResult.response;
  }
  const { splitAddress, chainId, tokenAddress } = validationResult.data;

  try {
    const hash = await distribute({
      splitAddress,
      tokenAddress,
      chainId,
    });
    return Response.json({
      status: 'success',
      hash,
    });
  } catch (error) {
    console.error('Error in distribute API:', error);
    return Response.json(
      {
        status: 'error',
        message: 'An error occurred while distributing.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
