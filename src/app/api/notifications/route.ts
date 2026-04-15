import { NextRequest, NextResponse } from 'next/server';
import validateGetNotificationsQuery from '@/lib/notifications/validateGetNotificationsQuery';
import validatePutNotificationsQuery from '@/lib/notifications/validatePutNotificationsQuery';
import getNotificationsHandler from '@/lib/notifications/getNotificationsHandler';
import putNotificationsHandler from '@/lib/notifications/putNotificationsHandler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const validated = validateGetNotificationsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getNotificationsHandler(validated);
  } catch (e: any) {
    return Response.json({ message: e?.message ?? 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const validated = validatePutNotificationsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return putNotificationsHandler(validated.artist);
  } catch (e: any) {
    return Response.json({ message: e?.message ?? 'Failed' }, { status: 500 });
  }
}
