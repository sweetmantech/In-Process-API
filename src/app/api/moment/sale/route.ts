import { NextRequest, NextResponse } from 'next/server';
import validateUpdateSaleBody from '@/lib/moment/validateUpdateSaleBody';
import updateSaleHandler from '@/lib/moment/updateSaleHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateUpdateSaleBody(req);
    if (validated instanceof NextResponse) return validated;
    const {
      callerAddress,
      moment,
      pricePerToken,
      saleStart,
      saleEnd,
      maxTokensPerAddress,
      fundsRecipient,
    } = validated;
    return await updateSaleHandler(
      moment,
      callerAddress,
      pricePerToken,
      saleStart,
      saleEnd,
      maxTokensPerAddress,
      fundsRecipient
    );
  } catch (e: any) {
    const message = e?.message ?? 'Failed to update sale';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
