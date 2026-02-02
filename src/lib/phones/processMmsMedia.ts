import type { InboundMessagePayload } from 'telnyx/resources/shared';
import createMomentFromMedia from '@/lib/phones/createMomentFromMedia';
import { Database } from '@/lib/supabase/types';
import { processVideoMessage } from '@/lib/messages/processVideoMessage';
import { processMomentMessage } from '@/lib/messages/processMomentMessage';

export const processMmsMedia = async (
  phone: Database['public']['Tables']['in_process_artist_phones']['Row'] & {
    artist: Database['public']['Tables']['in_process_artists']['Row'];
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
  await processMomentMessage(
    contractAddress,
    tokenId,
    phone.phone_number,
    phone.artist.address
  );
  return { contractAddress, tokenId };
};
