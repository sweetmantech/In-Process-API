import { z } from 'zod';
import addressSchema from './addressSchema';

const artistCollageQuerySchema = z.object({
  artistAddress: addressSchema,
  chainId: z.coerce.number().int().optional(),
});

export default artistCollageQuerySchema;
