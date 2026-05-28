import type { InboundMessagePayload } from 'telnyx/resources/shared';
import createMomentFromMedia from '@/lib/phones/createMomentFromMedia';
import { sendVideoNotSupported } from '@/lib/messages/sendVideoNotSupported';
import { sendSms } from '@/lib/phones/sendSms';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';

import type { ArtistContext } from '@/types/artist';

export const processMmsMedia = async (
  phone: {
    phone_number: string;
    artist: ArtistContext;
  },
  media: NonNullable<InboundMessagePayload['media']>[number],
  payload: InboundMessagePayload | undefined
): Promise<{ contractAddress: string; tokenId: string } | void> => {
  if (media.content_type?.includes('video')) {
    await sendVideoNotSupported(phone.phone_number, phone.artist.primaryWallet);
    return;
  }
  const { contractAddress, tokenId } = await createMomentFromMedia(
    media,
    payload,
    phone.artist.primaryWallet
  );
  const message = getMomentSuccessMessage(contractAddress, tokenId);
  await sendSms(phone.phone_number, message);
  return { contractAddress, tokenId };
};
