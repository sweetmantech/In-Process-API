import type { Address } from 'viem';
import { NextResponse } from 'next/server';
import type { InboundMessageWebhookEvent } from 'telnyx/resources/webhooks';
import { processMmsMedia } from '@/lib/phones/processMmsMedia';
import selectPhone from '@/lib/supabase/in_process_artist_phones/selectPhone';
import { sendNewbieWelcome } from '@/lib/messages/sendNewbieWelcome';
import { sendVerificationRequest } from '@/lib/messages/sendVerificationRequest';
import verifyAndNotifyPhone from '@/lib/messages/verifyAndNotifyPhone';
import truncateAddress from '@/lib/truncateAddress';
import getPrimaryWallet from '@/lib/wallets/getPrimaryWallet';
import type { ArtistContext } from '@/types/artist';
import type { Tables } from '@/lib/supabase/types';
import type { WalletType } from '@/types/wallets';

const smsWebhookHandler = async (event: InboundMessageWebhookEvent) => {
  if (event.data?.event_type === 'message.received') {
    const messageText = event.data.payload?.text?.toLowerCase().trim();
    const fromPhoneNumber = event.data.payload?.from?.phone_number;
    const media = event.data.payload?.media;

    if (fromPhoneNumber) {
      const { data: phone } = await selectPhone({
        phone_number: fromPhoneNumber,
      });
      if (phone) {
        const artistData = phone.artist;
        const wallets = (artistData?.wallets ??
          []) as Tables<'in_process_wallets'>[];
        const primaryWallet = getPrimaryWallet(wallets) as Address | undefined;
        const artist: ArtistContext | null =
          artistData && primaryWallet
            ? {
                artistId: artistData.id,
                primaryWallet,
                wallets: wallets.map((w) => ({
                  address: w.address as Address,
                  type: w.type as WalletType,
                })),
              }
            : null;

        if (phone.verified) {
          if (media && media?.length > 0 && artist) {
            await processMmsMedia(
              { phone_number: phone.phone_number, artist },
              media[0],
              event.data.payload
            );
          }
        } else if (messageText === 'yes') {
          const username = artistData?.username;
          const displayName = username || truncateAddress(primaryWallet ?? '');
          await verifyAndNotifyPhone(displayName, fromPhoneNumber);
        } else {
          await sendVerificationRequest(fromPhoneNumber, primaryWallet ?? '');
        }
      } else {
        await sendNewbieWelcome(messageText || '', fromPhoneNumber);
      }
    }
  }

  return NextResponse.json({ success: true });
};

export default smsWebhookHandler;
