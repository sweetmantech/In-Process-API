import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';

const connectArtistWalletSchema = z.object({
  external_wallet: addressSchema,
});

export default connectArtistWalletSchema;
