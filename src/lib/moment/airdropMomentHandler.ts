import type { ArtistContext } from '@/types/artist';
import { airdropMoment } from './airdropMoment';
import { z } from 'zod';
import { airdropMomentSchema } from '@/lib/schema/airdropMomentSchema';
import resolveAirdropRecipients from './resolveAirdropRecipients';

type AirdropMomentHandlerInput = z.infer<typeof airdropMomentSchema> & {
  artist: ArtistContext;
};

const airdropMomentHandler = async (params: AirdropMomentHandlerInput) => {
  const recipients = await resolveAirdropRecipients(params.recipients);
  const result = await airdropMoment({ ...params, recipients });
  return Response.json(result);
};

export default airdropMomentHandler;
