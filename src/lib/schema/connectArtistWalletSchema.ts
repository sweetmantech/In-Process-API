import { z } from 'zod';

const connectArtistWalletSchema = z.object({
  artist_wallet: z.string().min(1, 'artist_wallet is required'),
  social_wallet: z.string().min(1, 'social_wallet is required'),
});

export default connectArtistWalletSchema;
