import type { AuthResult } from '@/types/auth';
import type { ArtistContext } from '@/types/artist';

const toArtistContext = ({
  artistId,
  primaryWallet,
  wallets,
}: AuthResult): ArtistContext => ({
  artistId,
  primaryWallet,
  wallets,
});

export default toArtistContext;
