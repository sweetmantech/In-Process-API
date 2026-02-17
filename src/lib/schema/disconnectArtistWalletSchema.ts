import { z } from 'zod';

const disconnectArtistWalletSchema = z.object({
  social_wallet: z.string().min(1, 'social_wallet is required'),
});

export default disconnectArtistWalletSchema;
