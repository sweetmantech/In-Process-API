import { z } from 'zod';
import addressSchema from './addressSchema';

export const getSmartWalletSchema = z.object({
  artist_wallet: addressSchema,
});
