import { NextRequest, NextResponse } from 'next/server';
import validateRegisterPhoneBody from '@/lib/phones/validateRegisterPhoneBody';
import validateDeletePhone from '@/lib/phones/validateDeletePhone';
import registerPhoneHandler from '@/lib/phones/registerPhoneHandler';
import deletePhoneHandler from '@/lib/phones/deletePhoneHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateRegisterPhoneBody(req);
    if (validated instanceof NextResponse) return validated;
    return registerPhoneHandler(validated);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Failed to register phone number';
    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validated = await validateDeletePhone(req);
    if (validated instanceof NextResponse) return validated;
    return deletePhoneHandler(validated);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Failed to disconnect phone number';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
