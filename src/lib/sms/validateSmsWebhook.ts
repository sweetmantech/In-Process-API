import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/telnyx/client';
import type { InboundMessageWebhookEvent } from 'telnyx/resources/webhooks';

const validateSmsWebhook = async (req: NextRequest) => {
  const body = await req.text();

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  try {
    const event = client.webhooks.unwrap<InboundMessageWebhookEvent>(body, {
      headers,
      key: process.env.TELNYX_PUBLIC_KEY,
    });
    return event;
  } catch (err) {
    console.error('Signature verification failed:', err);
    return NextResponse.json(
      { message: 'Signature verification failed' },
      { status: 400 }
    );
  }
};

export default validateSmsWebhook;
