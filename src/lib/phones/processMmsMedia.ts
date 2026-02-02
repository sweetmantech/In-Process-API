import type { InboundMessagePayload } from 'telnyx/resources/shared';
import createMomentFromMedia from '@/lib/phones/createMomentFromMedia';
import { sendSms } from '@/lib/phones/sendSms';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';
import { Database } from '../supabase/types';
import { logMessage } from '../messages/logMessage';
import { tasks } from '@trigger.dev/sdk';

export const processMmsMedia = async (
  phone: Database['public']['Tables']['in_process_artist_phones']['Row'] & {
    artist: Database['public']['Tables']['in_process_artists']['Row'];
  },
  media: NonNullable<InboundMessagePayload['media']>[number],
  payload: InboundMessagePayload | undefined
): Promise<{ contractAddress: string; tokenId: string } | void> => {
  if (media.content_type?.includes('video')) {
    const message =
      'Sorry, videos are not supported because their quality is significantly degraded when sent via SMS text message. Please go to https://inprocess.world/create to upload videos.';
    await logMessage(
      [
        {
          type: 'text',
          text: message,
        },
      ],
      'assistant',
      phone.artist.address
    );
    await sendSms(phone.phone_number, message);
    return;
  }
  const { contractAddress, tokenId } = await createMomentFromMedia(
    media,
    payload,
    phone.artist.address
  );
  const message = `Moment created! ${SITE_ORIGINAL_URL}/sms/${IS_TESTNET ? 'bsep' : 'base'}:${contractAddress}/${tokenId}`;
  const messageId = await logMessage(
    [
      {
        type: 'text',
        text: message,
      },
    ],
    'assistant',
    phone.artist.address
  );
  if (messageId) {
    await tasks.trigger('process-message-moment', {
      messageId,
    });
  }
  await sendSms(phone.phone_number, message);
  return { contractAddress, tokenId };
};
