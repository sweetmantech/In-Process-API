import { Address } from 'viem';
import getPrivyLinkedAccount from './getPrivyLinkedAccount';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import type { ArtistContext } from '@/types/artist';

export async function getWalletsByPrivyToken(
  authToken: string
): Promise<ArtistContext> {
  const { linkedAccount, type } = await getPrivyLinkedAccount(authToken);
  return getOrCreateArtist({ address: linkedAccount as Address, type });
}
