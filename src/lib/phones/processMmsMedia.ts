import type { InboundMessagePayload } from 'telnyx/resources/shared';
import createMomentFromMedia from '@/lib/phones/createMomentFromMedia';
import { processVideoMessage } from '@/lib/messages/processVideoMessage';
import { sendSms } from '@/lib/phones/sendSms';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';

export const processMmsMedia = async (
  phone: {
    phone_number: string;
    artist: { address: string };
  },
  media: NonNullable<InboundMessagePayload['media']>[number],
  payload: InboundMessagePayload | undefined
): Promise<{ contractAddress: string; tokenId: string } | void> => {
  if (media.content_type?.includes('video')) {
    await processVideoMessage(phone.phone_number, phone.artist.address);
    return;
  }
  const { contractAddress, tokenId } = await createMomentFromMedia(
    media,
    payload,
    phone.artist.address
  );
  const message = getMomentSuccessMessage(contractAddress, tokenId);
  await sendSms(phone.phone_number, message);
  return { contractAddress, tokenId };
};
