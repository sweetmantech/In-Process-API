import { NextRequest } from 'next/server';
import client from '@/lib/telnyx/client';
import type { InboundMessageWebhookEvent } from 'telnyx/resources/webhooks';
import { processMmsMedia } from '@/lib/phones/processMmsMedia';
import selectPhone from '@/lib/supabase/in_process_artist_phones/selectPhone';
import { logMessage } from '@/lib/messages/logMessage';
import { processMessageFromNewbie } from '@/lib/messages/processMessageFromNewbie';
import { processVerificationRequestMessage } from '@/lib/messages/processVerificationRequestMessage';
import processVerificationMessage from '@/lib/messages/processVerificationMessage';
import truncateAddress from '@/lib/truncateAddress';

export async function POST(req: NextRequest) {
  try {
    // Get the raw body as string for signature verification
    const body = await req.text();

    // Convert Next.js headers to plain object for Telnyx SDK
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Verify webhook signature using Telnyx SDK
    let event: InboundMessageWebhookEvent;
    try {
      event = client.webhooks.unwrap<InboundMessageWebhookEvent>(body, {
        headers,
        key: process.env.TELNYX_PUBLIC_KEY,
      });
    } catch (err) {
      console.error('Signature verification failed:', err);
      return Response.json(
        { message: 'Signature verification failed' },
        { status: 400 }
      );
    }
    // Check if this is a message.received event
    if (event.data?.event_type === 'message.received') {
      const messageText = event.data.payload?.text?.toLowerCase().trim();
      const fromPhoneNumber = event.data.payload?.from?.phone_number;
      const media = event.data.payload?.media;

      if (fromPhoneNumber) {
        const { data: phone } = await selectPhone(fromPhoneNumber);
        if (phone) {
          await logMessage(
            [
              {
                type: 'text',
                text: messageText || '',
              },
            ],
            'user',
            undefined,
            phone.artist_address
          );
          if (phone.verified) {
            if (media && media?.length > 0)
              await processMmsMedia(phone, media[0], event.data.payload);
          } else {
            if (messageText === 'yes') {
              await processVerificationMessage(
                phone.artist.username || truncateAddress(phone.artist_address),
                fromPhoneNumber
              );
            } else
              await processVerificationRequestMessage(
                messageText || '',
                fromPhoneNumber
              );
          }
        } else
          await processMessageFromNewbie(messageText || '', fromPhoneNumber);
      }
    }

    return Response.json({ success: true });
  } catch (e: any) {
    const message = e?.message || 'Failed to process webhook';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
