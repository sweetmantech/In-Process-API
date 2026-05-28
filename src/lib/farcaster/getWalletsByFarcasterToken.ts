import { Address } from 'viem';
import { verifyJwt } from '@/lib/jwt/verifyJwt';
import verifyFarcasterAuth from '@/lib/farcaster/verifyFarcasterAuth';
import { farcasterAuthSchema } from '@/lib/schema/farcasterAuthSchema';
import { AuthErrorMessages } from '@/errors';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import { WalletType } from '@/types/wallets';

export async function getWalletsByFarcasterToken(token: string): Promise<{
  primaryWallet: Address;
  wallets: { address: Address; type: WalletType }[];
  artistId: string;
}> {
  const raw = verifyJwt(token, process.env.FARCASTER_JWT_SECRET!);

  const parsed = farcasterAuthSchema.safeParse(raw);
  if (!parsed.success) throw new Error(AuthErrorMessages.INVALID_AUTH_TOKEN);

  const { verifiedAddress, artistName } = await verifyFarcasterAuth(
    parsed.data.message,
    parsed.data.signature
  );

  const normalized = verifiedAddress.toLowerCase();

  const [upserted] = await upsertWallets([
    {
      address: normalized,
      type: 'farcaster',
    },
  ]);

  let artistId = upserted.artist_id;
  let username = upserted?.artist?.username || artistName;

  if (!artistId || !upserted?.artist?.username) {
    const [created] = await upsertArtists(
      artistId ? { id: artistId, username } : { username }
    );
    if (!created) throw new Error('Failed to create artist entity');
    if (!artistId) {
      artistId = created.id;
      await upsertWallets([{ address: normalized, artist: artistId }]);
    }
  }

  const { data: linkedWallets } = await selectWallets({
    artistIds: [artistId],
  });

  return {
    artistId,
    primaryWallet: normalized as Address,
    wallets: linkedWallets?.map((w) => ({
      address: w.address as Address,
      type: w.type as WalletType,
    })) || [
      { address: normalized as Address, type: 'farcaster' as WalletType },
    ],
  };
}
