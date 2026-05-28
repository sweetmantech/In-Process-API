import { NextRequest, NextResponse } from 'next/server';
import validateSmsWebhook from '@/lib/sms/validateSmsWebhook';
import smsWebhookHandler from '@/lib/sms/smsWebhookHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateSmsWebhook(req);
    if (validated instanceof NextResponse) return validated;
    return smsWebhookHandler(validated);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Failed to process webhook';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
