import { NextRequest } from 'next/server';
import client from '@/lib/telnyx/client';
import type { InboundMessageWebhookEvent } from 'telnyx/resources/webhooks';
import { processMmsMedia } from '@/lib/phones/processMmsMedia';
import selectPhone from '@/lib/supabase/in_process_artist_phones/selectPhone';
import { sendNewbieWelcome } from '@/lib/messages/sendNewbieWelcome';
import { sendVerificationRequest } from '@/lib/messages/sendVerificationRequest';
import verifyAndNotifyPhone from '@/lib/messages/verifyAndNotifyPhone';
import truncateAddress from '@/lib/truncateAddress';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

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

    if (event.data?.event_type === 'message.received') {
      const messageText = event.data.payload?.text?.toLowerCase().trim();
      const fromPhoneNumber = event.data.payload?.from?.phone_number;
      const media = event.data.payload?.media;

      if (fromPhoneNumber) {
        const { data: phone } = await selectPhone(fromPhoneNumber);
        if (phone) {
          if (phone.verified) {
            if (media && media?.length > 0)
              await processMmsMedia(
                {
                  phone_number: phone.phone_number,
                  artist: { address: phone.artist_address },
                },
                media[0],
                event.data.payload
              );
          } else {
            if (messageText === 'yes') {
              const { data: walletRows } = await selectWallets({
                addresses: [phone.artist_address],
              });
              const username = walletRows?.[0]?.artist?.username;
              const displayName =
                username || truncateAddress(phone.artist_address);
              await verifyAndNotifyPhone(displayName, fromPhoneNumber);
            } else
              await sendVerificationRequest(
                fromPhoneNumber,
                phone.artist_address
              );
          }
        } else await sendNewbieWelcome(messageText || '', fromPhoneNumber);
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
