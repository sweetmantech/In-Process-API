import { z } from 'zod';
import addressSchema from '@/lib/schema/addressSchema';

const walletDisconnectBodySchema = z.object({
  address: addressSchema,
});

export default walletDisconnectBodySchema;
