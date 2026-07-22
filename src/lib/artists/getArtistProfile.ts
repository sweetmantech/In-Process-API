import { Address } from 'viem';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import selectPhone from '@/lib/supabase/in_process_artist_phones/selectPhone';
import resolveAddressToEns from '@/lib/ens/resolveAddressToEns';
import getFarcasterUsernameByAddress from '@/lib/farcaster/getFarcasterUsernameByAddress';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';

const emptyProfile = {
  id: undefined as string | undefined,
  username: null as string | null,
  bio: null as string | null,
  instagram: null as string | null,
  x: null as string | null,
  telegram: null as string | null,
};

const getArtistProfile = async (address: string) => {
  try {
    const normalized = address.toLowerCase();

    const [upserted] = await upsertWallets([{ address: normalized }]);
    let profile = upserted.artist ?? emptyProfile;

    let phone;
    if (upserted.artist_id) {
      const { data, error: phoneError } = await selectPhone({
        artist_id: upserted.artist_id,
      });
      if (phoneError) throw phoneError;
      phone = data ?? undefined;
    }

    if (!profile.username) {
      const username =
        (await getFarcasterUsernameByAddress(address)) ||
        (await resolveAddressToEns(address as Address));
      const [saved] = await upsertArtists(
        profile.id ? { id: profile.id, username } : { username }
      );
      if (!saved) throw new Error('Failed to save artist entity');
      profile = { ...profile, id: saved.id, username };
      if (!upserted.artist) {
        await upsertWallets([{ address: normalized, artist: saved.id }]);
      }
    }

    return { ...profile, phone };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getArtistProfile;
