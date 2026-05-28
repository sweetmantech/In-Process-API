import type { ArtistContext } from '@/types/artist';
import { Address } from 'viem';
import { airdropMoment } from './airdropMoment';
import { z } from 'zod';
import { airdropMomentSchema } from '@/lib/schema/airdropMomentSchema';

type AirdropMomentHandlerInput = z.infer<typeof airdropMomentSchema> & {
  artist: ArtistContext;
};

const airdropMomentHandler = async (params: AirdropMomentHandlerInput) => {
  const result = await airdropMoment(params);
  return Response.json(result);
};

export default airdropMomentHandler;
