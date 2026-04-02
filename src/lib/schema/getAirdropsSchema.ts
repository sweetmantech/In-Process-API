import { z } from 'zod';
import addressSchema from './addressSchema';
import chainIdSchema from './chainIdSchema';

export const getAirdropsSchema = z.object({
  artist_address: addressSchema,
  chainId: chainIdSchema,
  offset: z.coerce.number().optional().default(0),
});
