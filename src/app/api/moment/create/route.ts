import { NextRequest } from 'next/server';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';
import { createMoment } from '@/lib/moment/createMoment';
import { validate } from '@/lib/schema/validate';
import getChannelFromReqHeader from '@/lib/moment/getChannelFromReqHeader';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = validate(createMomentSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }
    const data = validationResult.data;
    const channel = data.channel ?? getChannelFromReqHeader(req);
    const result = await createMoment({ ...data, channel });
    return Response.json(result);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create moment';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
