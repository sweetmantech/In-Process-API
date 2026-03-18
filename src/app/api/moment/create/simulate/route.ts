import { NextRequest } from 'next/server';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';
import { simulateCreateMoment } from '@/lib/moment/simulateCreateMoment';
import { validate } from '@/lib/schema/validate';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = validate(createMomentSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }
    const result = await simulateCreateMoment(validationResult.data);
    return Response.json(result);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to simulate create moment';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
